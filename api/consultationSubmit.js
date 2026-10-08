import nodemailer from 'nodemailer'
import { resolveMailConfig } from './mailSettings.js'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildTransporter(mail) {
  if (!mail?.host || !mail?.user || !mail?.pass) return null
  return nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure,
    auth: {
      user: mail.user,
      pass: mail.pass,
    },
  })
}

/**
 * @param {unknown} rawBody - Parsed JSON body from POST
 * @returns {Promise<{ statusCode: number, payload: Record<string, unknown> }>}
 */
export async function handleConsultationSubmit(rawBody) {
  const body = rawBody && typeof rawBody === 'object' ? rawBody : {}

  const name = String(body.name || '').trim().slice(0, 120)
  const email = String(body.email || '').trim().slice(0, 254)
  const phone = String(body.phone || '').trim().slice(0, 40)
  const company = String(body.company || '').trim().slice(0, 120)
  const topic = String(body.topic || '').trim().slice(0, 80)
  const message = String(body.message || '').trim().slice(0, 8000)
  const inquiryId = String(body.inquiryId || '').trim().slice(0, 128)
  const website = String(body.website || '').trim()

  if (website) {
    return {
      statusCode: 200,
      payload: { ok: true, emailsSent: false, ignored: true, submitted: false },
    }
  }

  if (!name || !email || !message) {
    return {
      statusCode: 400,
      payload: { ok: false, error: 'Name, email, and message are required.' },
    }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    return { statusCode: 400, payload: { ok: false, error: 'Invalid email address.' } }
  }

  const mail = await resolveMailConfig()
  // Consultation inbox is optional now: fall back to the SMTP sender account so
  // requests still reach the business, and the business is also kept on CC of
  // the client's confirmation email.
  const teamTo = mail.notifyEmail || mail.user || ''
  const from = mail.from
  if (!teamTo || !from) {
    return {
      statusCode: 200,
      payload: {
        ok: true,
        emailsSent: false,
        submitted: true,
        reason: 'Sender/from address is not set',
      },
    }
  }

  const transporter = buildTransporter(mail)
  if (!transporter) {
    return {
      statusCode: 200,
      payload: {
        ok: true,
        emailsSent: false,
        submitted: true,
        reason: 'SMTP not configured',
      },
    }
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    company: escapeHtml(company),
    topic: escapeHtml(topic),
    message: escapeHtml(message),
    inquiryId: escapeHtml(inquiryId),
  }

  const textTeam = [
    'New consultation request',
    inquiryId ? `Reference: ${inquiryId}` : '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : '',
    company ? `Company: ${company}` : '',
    topic ? `Topic: ${topic}` : '',
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n')

  const htmlTeam = `
    <h2>New consultation request</h2>
    ${inquiryId ? `<p><strong>Reference:</strong> ${safe.inquiryId}</p>` : ''}
    <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#64748b">Name</td><td>${safe.name}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#64748b">Email</td><td><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
      ${phone ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Phone</td><td>${safe.phone}</td></tr>` : ''}
      ${company ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Company</td><td>${safe.company}</td></tr>` : ''}
      ${topic ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Topic</td><td>${safe.topic}</td></tr>` : ''}
    </table>
    <p style="margin-top:16px;font-family:system-ui,sans-serif;font-size:14px"><strong>Message</strong></p>
    <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;border-left:3px solid #0891b2;padding-left:12px">${safe.message}</p>
  `

  const textClient = `Hi ${name},

Thanks for booking a consultation with us. We've received your request and will get back to you shortly.

Summary:
${topic ? `Topic: ${topic}\n` : ''}${message}

If you didn't submit this form, you can ignore this email.

— Team`

  const htmlClient = `
    <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#0f172a">Hi ${safe.name},</p>
    <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#334155">Thanks for booking a consultation. We've received your request and will get back to you shortly.</p>
    ${topic ? `<p style="font-family:system-ui,sans-serif;font-size:14px"><strong>Topic:</strong> ${safe.topic}</p>` : ''}
    <p style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;color:#334155;border-left:3px solid #0891b2;padding-left:12px">${safe.message}</p>
    <p style="font-family:system-ui,sans-serif;font-size:13px;color:#64748b;margin-top:24px">If you didn't submit this form, you can ignore this email.</p>
  `

  try {
    await transporter.sendMail({
      from,
      to: teamTo,
      replyTo: email,
      subject: `New consultation: ${name}`,
      text: textTeam,
      html: htmlTeam,
    })

    await transporter.sendMail({
      from,
      to: email,
      cc: teamTo,
      subject: 'We received your consultation request',
      text: textClient,
      html: htmlClient,
    })

    return { statusCode: 200, payload: { ok: true, emailsSent: true, submitted: true } }
  } catch (err) {
    console.error('[sendConsultation]', err)
    return {
      statusCode: 500,
      payload: { ok: false, error: err?.message || 'Failed to send email' },
    }
  }
}
