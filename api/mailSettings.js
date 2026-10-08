import { createSign, createVerify } from 'crypto'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DATASTORE_SCOPE = 'https://www.googleapis.com/auth/datastore'
const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

let accessTokenCache = { token: '', exp: 0 }
let certCache = { certs: null, exp: 0 }

function normalizePort(value) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 65535) return 587
  return n
}

export function formatFrom(name, email) {
  const addr = String(email || '').trim()
  if (!addr) return ''
  const safeName = String(name || '')
    .trim()
    .replace(/["<>\r\n]/g, '')
  return safeName ? `"${safeName}" <${addr}>` : addr
}

export function envMailConfig() {
  return {
    host: (process.env.SMTP_HOST || '').trim(),
    port: normalizePort(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    user: (process.env.SMTP_USER || '').trim(),
    pass: process.env.SMTP_PASS || '',
    from: (process.env.MAIL_FROM || process.env.SMTP_USER || '').trim(),
    notifyEmail: (process.env.CONSULTATION_NOTIFY_EMAIL || '').trim(),
  }
}

/**
 * Firestore SMTP settings win when host, user, and password are saved.
 * Environment variables fill in only when the admin panel has not saved SMTP.
 */
export function pickMailConfig(store, env) {
  const storeReady = Boolean(store?.smtpHost && store?.smtpUser && store?.smtpPass)
  if (storeReady) {
    const fromEmail = String(store.fromEmail || '').trim()
    return {
      host: String(store.smtpHost).trim(),
      port: normalizePort(store.smtpPort),
      secure: store.smtpSecure === true || String(store.smtpSecure).toLowerCase() === 'true',
      user: String(store.smtpUser).trim(),
      pass: String(store.smtpPass),
      from: fromEmail ? formatFrom(store.fromName, fromEmail) : env.from,
      notifyEmail: String(store.notifyEmail || env.notifyEmail || '').trim(),
      source: 'firestore',
    }
  }
  if (env.host && env.user) {
    return { ...env, source: 'env' }
  }
  return {
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    notifyEmail: '',
    source: 'none',
  }
}

function parseServiceAccount(text, label) {
  const parsed = JSON.parse(text)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`${label} is missing project_id, client_email, or private_key`)
  }
  return parsed
}

function serviceAccountFromFile(filePath) {
  return parseServiceAccount(readFileSync(filePath, 'utf8'), filePath)
}

function findLocalServiceAccountFile() {
  const explicit = (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '').trim()
  if (explicit) return explicit
  try {
    const names = readdirSync(process.cwd()).filter(
      (name) => name.endsWith('.json') && name.includes('firebase-adminsdk')
    )
    if (names.length === 1) return join(process.cwd(), names[0])
  } catch {
    /* project root not readable */
  }
  return ''
}

function loadServiceAccount() {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim()
  if (raw.startsWith('{')) {
    return parseServiceAccount(raw, 'FIREBASE_SERVICE_ACCOUNT')
  }
  if (raw) {
    const decoded = Buffer.from(raw, 'base64').toString('utf8').trim()
    if (decoded.startsWith('{')) return parseServiceAccount(decoded, 'FIREBASE_SERVICE_ACCOUNT')
    if (raw.endsWith('.json')) return serviceAccountFromFile(raw)
  }

  const filePath = findLocalServiceAccountFile()
  if (filePath) return serviceAccountFromFile(filePath)

  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim()
  const projectId = (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    ''
  ).trim()
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
  if (!clientEmail || !privateKey || !projectId) return null
  privateKey = privateKey.replace(/\\n/g, '\n')
  return { project_id: projectId, client_email: clientEmail, private_key: privateKey }
}

function projectIdFromEnv() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    ''
  ).trim()
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)
  if (accessTokenCache.token && now < accessTokenCache.exp - 60) {
    return accessTokenCache.token
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim = Buffer.from(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: DATASTORE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url')
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claim}`)
  signer.end()
  const assertion = `${header}.${claim}.${signer.sign(serviceAccount.private_key, 'base64url')}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Could not authenticate to Firestore')
  }
  accessTokenCache = {
    token: data.access_token,
    exp: now + (Number(data.expires_in) || 3600),
  }
  return data.access_token
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return undefined
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('nullValue' in value) return null
  return undefined
}

function decodeFirestoreDoc(json) {
  const fields = json?.fields || {}
  const out = {}
  for (const [key, value] of Object.entries(fields)) {
    out[key] = decodeFirestoreValue(value)
  }
  return out
}

async function firestoreGet(path, serviceAccount) {
  const projectId = serviceAccount.project_id
  const token = await getAccessToken(serviceAccount)
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 404) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error?.message || 'Could not read Firestore')
  }
  return decodeFirestoreDoc(data)
}

export async function loadMailSettingsFromFirestore() {
  const serviceAccount = loadServiceAccount()
  if (!serviceAccount) return null
  return firestoreGet('settings/mail', serviceAccount)
}

export async function resolveMailConfig() {
  let store = null
  try {
    store = await loadMailSettingsFromFirestore()
  } catch (err) {
    console.error('[mailSettings]', err?.message || err)
  }
  return pickMailConfig(store, envMailConfig())
}

function decodeJwtPart(part) {
  const pad = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(pad, 'base64').toString('utf8'))
}

async function getFirebaseCerts() {
  if (certCache.certs && Date.now() < certCache.exp) return certCache.certs
  const res = await fetch(FIREBASE_CERTS_URL)
  if (!res.ok) throw new Error('Could not verify session')
  const certs = await res.json()
  const cacheControl = res.headers.get('cache-control') || ''
  const match = cacheControl.match(/max-age=(\d+)/)
  const ttlMs = (match ? Number(match[1]) : 3600) * 1000
  certCache = { certs, exp: Date.now() + ttlMs }
  return certs
}

export async function verifyFirebaseIdToken(idToken) {
  const projectId = projectIdFromEnv() || loadServiceAccount()?.project_id || ''
  if (!projectId) throw new Error('Firebase project id is not configured on the server')

  const parts = String(idToken || '').split('.')
  if (parts.length !== 3) throw new Error('Invalid session')
  const [headerPart, payloadPart, signature] = parts
  const header = decodeJwtPart(headerPart)
  const payload = decodeJwtPart(payloadPart)
  const certs = await getFirebaseCerts()
  const cert = certs[header.kid]
  if (!cert || header.alg !== 'RS256') throw new Error('Invalid session')

  const verifier = createVerify('RSA-SHA256')
  verifier.update(`${headerPart}.${payloadPart}`)
  verifier.end()
  if (!verifier.verify(cert, signature, 'base64url')) throw new Error('Invalid session')

  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) throw new Error('Session expired. Sign in again.')
  if (payload.aud !== projectId) throw new Error('Invalid session')
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Invalid session')
  if (!payload.sub) throw new Error('Invalid session')
  return payload
}

export async function loadUserRole(uid) {
  const serviceAccount = loadServiceAccount()
  if (!serviceAccount) {
    throw new Error(
      'Firebase service account is not set on the server, so saved mail settings cannot be read.'
    )
  }
  const user = await firestoreGet(`users/${uid}`, serviceAccount)
  return user?.role || ''
}
