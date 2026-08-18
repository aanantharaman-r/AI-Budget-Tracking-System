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
    salary: '50000',
  })
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      return setError('Please fill in all required fields.')
    }

    if (mode === 'register') {
      if (!form.name.trim()) return setError('Please enter your full name.')
      updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        currency: 'INR',
        monthlySalary: parseFloat(form.salary) || 0,
        startingBalance: 0,
        role: 'Personal Account',
        avatarColor: 'from-emerald-400 to-cyan-500',
        notifications: {
          budgetAlerts: true,
          monthlySummary: true,
          tips: true,
          marketing: false,
        },
      })
      login()
      if (showToast) showToast(`Welcome ${form.name.trim()}! Account created successfully.`)
    } else {
      login()
      if (showToast) showToast('Logged in successfully!')
    }

    onClose()
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

        {mode === 'register' && (
          <div>
            <label className="label mb-1.5 flex items-center gap-1">
              <IndianRupee size={14} className="text-amber-400" /> Initial Monthly Salary (₹)
            </label>
            <input
              className="input"
              type="number"
              step="500"
              placeholder="50000"
              value={form.salary}
              onChange={(e) => set('salary', e.target.value)}
            />
          </div>
        )}

        {error && <p className="rounded-xl bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400">{error}</p>}

        <button type="submit" className="btn-primary w-full py-3">
          {mode === 'register' ? (
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
