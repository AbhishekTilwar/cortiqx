import nodemailer from 'nodemailer'
import { loadUserRole, resolveMailConfig, verifyFirebaseIdToken } from './mailSettings.js'

const MAX_RECIPIENTS = 50

function bearerToken(authorization) {
  const value = String(authorization || '')
  const match = value.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Admin-only: send one email per candidate using SMTP saved in Firestore (or env fallback).
 * @param {unknown} rawBody
 * @param {string} authorization
 */
export async function handleSendMail(rawBody, authorization) {
  const token = bearerToken(authorization)
  if (!token) {
    return { statusCode: 401, payload: { ok: false, error: 'Please sign in again.' } }
  }

  let uid
  try {
    const payload = await verifyFirebaseIdToken(token)
    uid = payload.sub
    const role = await loadUserRole(uid)
    if (role !== 'Admin') {
      return { statusCode: 403, payload: { ok: false, error: 'Only admins can send mail.' } }
    }
  } catch (err) {
    const message = err?.message || 'Please sign in again.'
    const statusCode = /service account/i.test(message) ? 503 : 401
    return { statusCode, payload: { ok: false, error: message } }
  }

  const body = rawBody && typeof rawBody === 'object' ? rawBody : {}
  const to = Array.isArray(body.to)
    ? [...new Set(body.to.map((item) => String(item || '').trim()).filter(isEmail))].slice(0, MAX_RECIPIENTS)
    : []
  const subject = String(body.subject || '').trim().slice(0, 200)
  const html = String(body.html || '').trim().slice(0, 100000)
  const text = String(body.text || '').trim().slice(0, 100000)

  if (to.length === 0) {
    return { statusCode: 400, payload: { ok: false, error: 'Select at least one valid email address.' } }
  }
  if (!subject) {
    return { statusCode: 400, payload: { ok: false, error: 'Subject is required.' } }
  }
  if (!html && !text) {
    return { statusCode: 400, payload: { ok: false, error: 'Message is required.' } }
  }

  const mail = await resolveMailConfig()
  if (!mail.host || !mail.user || !mail.pass || !mail.from) {
    return {
      statusCode: 503,
      payload: {
        ok: false,
        error: 'SMTP is not configured. Add it in Settings, and set a Firebase service account on the server so those settings can be read.',
      },
    }
  }

  const transporter = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure,
    auth: { user: mail.user, pass: mail.pass },
  })

  let sent = 0
  const failures = []
  for (const address of to) {
    try {
      await transporter.sendMail({
        from: mail.from,
        to: address,
        subject,
        text: text || undefined,
        html: html || undefined,
      })
      sent += 1
    } catch (err) {
      failures.push(address)
      console.error('[sendMail]', address, err?.message || err)
    }
  }

  if (sent === 0) {
    return { statusCode: 500, payload: { ok: false, error: 'Failed to send mail.', sent: 0 } }
  }

  return {
    statusCode: 200,
    payload: { ok: true, sent, failed: failures.length },
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON' })
    }
  }

  const { statusCode, payload } = await handleSendMail(body, req.headers.authorization)
  return res.status(statusCode).json(payload)
}
