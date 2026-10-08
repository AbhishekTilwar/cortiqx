import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiMail, FiKey, FiSave, FiAlertCircle } from 'react-icons/fi'
import './AdminSettings.css'

const defaultMailConfig = {
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
  fromName: '',
  notifyEmail: '',
  hasPassword: false,
}

export default function AdminSettings() {
  const [config, setConfig] = useState(defaultMailConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const existingRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, 'settings', 'mail')
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data()) {
          const data = snap.data()
          const hasPassword = Boolean(String(data.smtpPass || '').trim())
          const legacyPassword = hasPassword ? '' : String(data.appPassword || '').trim()
          existingRef.current = { hasPassword, legacyPassword }
          setConfig({
            smtpHost: data.smtpHost || (data.fromEmail ? 'smtp.gmail.com' : ''),
            smtpPort: data.smtpPort != null && data.smtpPort !== '' ? String(data.smtpPort) : '587',
            smtpSecure: data.smtpSecure === true,
            smtpUser: data.smtpUser || data.fromEmail || '',
            smtpPass: '',
            fromEmail: data.fromEmail || '',
            fromName: data.fromName || '',
            notifyEmail: data.notifyEmail || '',
            hasPassword: hasPassword || Boolean(legacyPassword),
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load mail settings.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setMessage(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const smtpHost = config.smtpHost.trim()
    const smtpUser = config.smtpUser.trim()
    const fromEmail = config.fromEmail.trim()
    const notifyEmail = config.notifyEmail.trim()
    const port = Number(config.smtpPort)

    if (!smtpHost) {
      setError('SMTP host is required.')
      return
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setError('SMTP port must be between 1 and 65535.')
      return
    }
    if (!smtpUser) {
      setError('SMTP username is required.')
      return
    }
    if (!fromEmail) {
      setError('From email is required.')
      return
    }

    const prev = existingRef.current || {}
    const typedPass = config.smtpPass.trim()
    if (!typedPass && !config.hasPassword && !prev.legacyPassword) {
      setError('SMTP password is required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        smtpHost,
        smtpPort: port,
        smtpSecure: Boolean(config.smtpSecure),
        smtpUser,
        ...(typedPass ? { smtpPass: typedPass } : {}),
        ...(!typedPass && !prev.hasPassword && prev.legacyPassword ? { smtpPass: prev.legacyPassword } : {}),
        fromEmail,
        fromName: config.fromName.trim(),
        notifyEmail,
        appPassword: deleteField(),
        clientId: deleteField(),
        clientSecret: deleteField(),
        refreshToken: deleteField(),
        clientEmail: deleteField(),
        privateKey: deleteField(),
        serviceClientId: deleteField(),
        authMethod: deleteField(),
      }
      await setDoc(doc(db, 'settings', 'mail'), payload, { merge: true })
      existingRef.current = { hasPassword: true, legacyPassword: '' }
      setConfig((current) => ({ ...current, smtpPass: '', hasPassword: true }))
      setMessage('SMTP settings saved. Consultation emails and candidate mail use this configuration.')
    } catch (err) {
      setError(err.message || 'Failed to save mail settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-settings-loading">
        <span>Loading mail settings…</span>
      </div>
    )
  }

  return (
    <div className="admin-settings">
      <motion.div
        className="admin-settings-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="admin-settings-header">
          <FiMail className="admin-settings-icon" />
          <h2>Mail configuration (SMTP)</h2>
          <p>
            These details are stored in Firebase and used for consultation emails and mail to candidates.
            For Gmail, host is smtp.gmail.com, port 587, and the password is a Google App Password.
            The server also needs a Firebase service account so it can read this document when sending.
          </p>
        </div>

        {error && (
          <div className="admin-settings-error" role="alert">
            <FiAlertCircle />
            {error}
          </div>
        )}
        {message && (
          <div className="admin-settings-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-settings-form">
          <div className="admin-settings-row">
            <label htmlFor="smtpHost">SMTP host *</label>
            <input
              id="smtpHost"
              name="smtpHost"
              type="text"
              value={config.smtpHost}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
              autoComplete="off"
              required
            />
          </div>

          <div className="admin-settings-split">
            <div className="admin-settings-row">
              <label htmlFor="smtpPort">Port *</label>
              <input
                id="smtpPort"
                name="smtpPort"
                type="number"
                min="1"
                max="65535"
                value={config.smtpPort}
                onChange={handleChange}
                required
              />
            </div>
            <label className="admin-settings-check">
              <input
                name="smtpSecure"
                type="checkbox"
                checked={config.smtpSecure}
                onChange={handleChange}
              />
              Use SSL (port 465)
            </label>
          </div>

          <div className="admin-settings-row">
            <label htmlFor="smtpUser">SMTP username *</label>
            <input
              id="smtpUser"
              name="smtpUser"
              type="text"
              value={config.smtpUser}
              onChange={handleChange}
              placeholder="hello@yourdomain.com"
              autoComplete="off"
              required
            />
          </div>

          <div className="admin-settings-row">
            <label htmlFor="smtpPass">
              <FiKey /> SMTP password {config.hasPassword ? '' : '*'}
            </label>
            <input
              id="smtpPass"
              name="smtpPass"
              type="password"
              value={config.smtpPass}
              onChange={handleChange}
              placeholder={config.hasPassword ? 'Saved — leave blank to keep it' : 'App password or SMTP password'}
              autoComplete="new-password"
            />
            <p className="admin-settings-hint">
              {config.hasPassword
                ? 'A password is already stored. Enter a new one only if you want to replace it.'
                : 'Gmail: Google Account → Security → 2-Step Verification → App passwords.'}
            </p>
          </div>

          <div className="admin-settings-row">
            <label htmlFor="fromEmail">From email *</label>
            <input
              id="fromEmail"
              name="fromEmail"
              type="email"
              value={config.fromEmail}
              onChange={handleChange}
              placeholder="hello@yourdomain.com"
              required
            />
          </div>

          <div className="admin-settings-row">
            <label htmlFor="fromName">From name</label>
            <input
              id="fromName"
              name="fromName"
              type="text"
              value={config.fromName}
              onChange={handleChange}
              placeholder="CortiqX"
            />
          </div>

          <div className="admin-settings-row">
            <label htmlFor="notifyEmail">Consultation inbox</label>
            <input
              id="notifyEmail"
              name="notifyEmail"
              type="email"
              value={config.notifyEmail}
              onChange={handleChange}
              placeholder="Leave blank to use the SMTP sender address"
            />
            <p className="admin-settings-hint">
              Optional. New consultation requests are sent here and the business is kept on CC of the
              confirmation the person receives. Leave blank to use the SMTP sender address above.
            </p>
          </div>

          <div className="admin-settings-actions">
            <motion.button
              type="submit"
              className="admin-settings-save"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSave />
              {saving ? 'Saving…' : 'Save SMTP settings'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
