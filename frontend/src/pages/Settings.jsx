import { useState, useRef } from 'react'
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  Save,
  Check,
  Camera,
  Upload,
  Trash2,
  LogOut,
} from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { CURRENCIES } from '../data/mockData'

const AVATAR_GRADIENTS = [
  'from-emerald-400 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-teal-400',
  'from-amber-400 to-orange-500',
  'from-indigo-500 to-rose-500',
  'from-rose-400 to-red-600',
]

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
  const { profile, updateProfile, isLoggedIn, logout } = useBudget()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl || '',
    avatarColor: profile.avatarColor || 'from-emerald-400 to-cyan-500',
    currency: profile.currency,
    monthlySalary: profile.monthlySalary || 0,
    startingBalance: profile.startingBalance,
    notifications: { ...profile.notifications },
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setNotif = (k, v) => setForm((f) => ({ ...f, notifications: { ...f.notifications, [k]: v } }))

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('Please select a valid image file', 'info')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      if (showToast) showToast('Image file size should be less than 5MB', 'info')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        set('avatarUrl', dataUrl)
        if (showToast) showToast('Profile picture selected!', 'success')
      }
    }
    reader.readAsDataURL(file)
  }

  const save = (e) => {
    e.preventDefault()
    updateProfile({
      ...profile,
      name: form.name,
      email: form.email,
      avatarUrl: form.avatarUrl,
      avatarColor: form.avatarColor,
      currency: form.currency,
      monthlySalary: parseFloat(form.monthlySalary) || 0,
      startingBalance: parseFloat(form.startingBalance) || 0,
      notifications: form.notifications,
    })
    if (showToast) showToast('Profile saved successfully')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Settings & profile</h2>
          <p className="mt-1 text-sm text-ink-2">Manage your account, preferences and photo.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <Shield size={13} /> Demo mode · no data leaves your device
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Section icon={User} title="Profile & Avatar Photo" desc="Customize your avatar photo and account details">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar Preview & Quick Actions */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={form.name}
                    className="h-24 w-24 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-xl shadow-black/40 transition group-hover:opacity-90"
                  />
                ) : (
                  <span
                    className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${form.avatarColor} text-2xl font-extrabold text-white shadow-xl shadow-black/40 ring-4 ring-white/10`}
                  >
                    {form.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:scale-110 hover:bg-emerald-400"
                  title="Upload profile photo"
                >
                  <Camera size={16} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-card-2"
                >
                  <Upload size={13} className="text-emerald-400" /> Upload
                </button>

                {form.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      set('avatarUrl', '')
                      if (showToast) showToast('Profile photo removed', 'info')
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                    title="Remove custom photo"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] font-semibold text-ink-2">
                {profile.role}
              </span>
            </div>

            {/* Name, Email, & Photo Presets */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full name</label>
                  <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>

              {/* Avatar Gradient Fallbacks */}
              <div>
                <label className="label mb-1.5 text-xs text-ink-3">
                  Initials Background Gradient (when no photo is set)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_GRADIENTS.map((grad) => (
                    <button
                      key={grad}
                      type="button"
                      onClick={() => set('avatarColor', grad)}
                      className={`h-7 w-7 rounded-lg bg-gradient-to-br ${grad} transition hover:scale-110 ${
                        form.avatarColor === grad ? 'ring-2 ring-white ring-offset-2 ring-offset-card' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Account Logout Option */}
              {isLoggedIn && (
                <div className="pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Account Session</p>
                    <p className="text-[11px] text-ink-3">Log out of your current profile session</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      if (showToast) showToast('Logged out of session', 'info')
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 active:scale-95"
                  >
                    <LogOut size={15} /> Log Out Account
                  </button>
                </div>
              )}
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
              { key: 'tips', label: 'AI tips & insights', desc: 'Personalized suggestions from Budz AI' },
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
          <span className="flex items-center gap-1.5 text-xs text-ink-3 sm:ml-auto">
            <Check size={13} className="text-emerald-400" /> All changes stored locally
          </span>
        </div>
      </form>
    </div>
  )
}
