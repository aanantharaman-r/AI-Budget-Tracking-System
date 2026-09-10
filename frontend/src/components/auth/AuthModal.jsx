import { useState } from 'react'
import { UserPlus, LogIn, Mail, Lock, User, IndianRupee } from 'lucide-react'
import Modal from '../ui/Modal'
import { useBudget } from '../../context/BudgetContext'

export default function AuthModal({ open, onClose, initialMode = 'login', showToast }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const { updateProfile, login } = useBudget()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      return setError('Please fill in all required fields.')
    }

    try {
      setSubmitting(true)
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register' 
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      updateProfile({
        name: data.user.name,
        email: data.user.email,
      })

      login(data.user)

      if (showToast) {
        showToast(mode === 'register' ? `Welcome ${data.user.name}! Account registered in MongoDB.` : `Welcome back ${data.user.name}! Logged in.`)
      }

      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'register' ? 'Create an Account' : 'Welcome Back'}
      subtitle={mode === 'register' ? 'Register to start tracking your AI budget' : 'Log in to access your budget dashboard'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="label mb-1.5 flex items-center gap-1">
              <User size={14} className="text-emerald-400" /> Full Name
            </label>
            <input
              className="input"
              placeholder="e.g. Alex Sharma"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="label mb-1.5 flex items-center gap-1">
            <Mail size={14} className="text-cyan-400" /> Email Address
          </label>
          <input
            className="input"
            type="email"
            placeholder="you@domain.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <div>
          <label className="label mb-1.5 flex items-center gap-1">
            <Lock size={14} className="text-violet-400" /> Password
          </label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
        </div>

        {error && <p className="rounded-xl bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-50">
          {submitting ? (
            'Please wait...'
          ) : mode === 'register' ? (
            <>
              <UserPlus size={16} /> Register Account
            </>
          ) : (
            <>
              <LogIn size={16} /> Log In
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-ink-2">
          {mode === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError('')
                }}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  )
}
