import { handleConsultationSubmit } from './consultationSubmit.js'

/**
 * Vercel serverless: sends team notification + client confirmation.
 * SMTP is read from Firestore settings/mail (admin panel). Env vars are a fallback.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

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

  const { statusCode, payload } = await handleConsultationSubmit(body)
  return res.status(statusCode).json(payload)
}
