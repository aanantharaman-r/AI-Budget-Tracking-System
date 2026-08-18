import { useState } from 'react'
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  Save,
  RefreshCcw,
  Check,
} from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { CURRENCIES } from '../data/mockData'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-white/10'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-emerald-400">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-100">{title}</h2>
          <p className="text-xs text-ink-3">{desc}</p>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

export default function Settings({ showToast }) {
  const { profile, updateProfile, resetData } = useBudget()
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    currency: profile.currency,
    monthlySalary: profile.monthlySalary || 0,
    startingBalance: profile.startingBalance,
    notifications: { ...profile.notifications },
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setNotif = (k, v) => setForm((f) => ({ ...f, notifications: { ...f.notifications, [k]: v } }))

  const save = (e) => {
    e.preventDefault()
    updateProfile({
      ...profile,
      name: form.name,
      email: form.email,
      currency: form.currency,
      monthlySalary: parseFloat(form.monthlySalary) || 0,
      startingBalance: parseFloat(form.startingBalance) || 0,
      notifications: form.notifications,
    })
    showToast('Profile saved successfully')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Settings & profile</h2>
          <p className="mt-1 text-sm text-ink-2">Manage your account, preferences and data.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <Shield size={13} /> Demo mode · no data leaves your device
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Section icon={User} title="Profile" desc="Your personal information">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.avatarColor} text-xl font-bold text-white shadow-lg shadow-black/30`}
              >
                {form.name.split(' ').map((n) => n[0]).join('')}
              </span>
              <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] font-semibold text-ink-2">
                {profile.role}
              </span>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Palette} title="Preferences" desc="Currency, salary and display options">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Monthly Salary</label>
              <input
                className="input"
                type="number"
                step="500"
                value={form.monthlySalary}
                onChange={(e) => set('monthlySalary', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Starting balance</label>
              <input
                className="input"
                type="number"
                step="100"
                value={form.startingBalance}
                onChange={(e) => set('startingBalance', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-ink-2" />
              <div>
                <p className="text-sm font-medium text-slate-100">Appearance</p>
                <p className="text-xs text-ink-3">Dark theme is always on</p>
              </div>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Dark</span>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" desc="Choose what the app should alert you about">
          <div className="space-y-3">
            {[
              { key: 'budgetAlerts', label: 'Budget alerts', desc: 'When a category crosses 80% of its limit' },
              { key: 'monthlySummary', label: 'Monthly summary', desc: 'A recap of your spending on the 1st' },
              { key: 'tips', label: 'AI tips & insights', desc: 'Personalized suggestions from Aura AI' },
              { key: 'marketing', label: 'Feature updates', desc: 'News about new features and promotions' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-100">{n.label}</p>
                  <p className="text-xs text-ink-3">{n.desc}</p>
                </div>
                <Toggle checked={form.notifications[n.key]} onChange={(v) => setNotif(n.key, v)} />
              </div>
            ))}
          </div>
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn-primary">
            <Save size={16} /> Save changes
          </button>
          <button
            type="button"
            onClick={() => {
              resetData()
              showToast('Demo data reset', 'info')
            }}
            className="btn-ghost"
          >
            <RefreshCcw size={16} /> Reset demo data
          </button>
          <span className="flex items-center gap-1.5 text-xs text-ink-3 sm:ml-auto">
            <Check size={13} className="text-emerald-400" /> All changes stored locally
          </span>
        </div>
      </form>
    </div>
  )
}
