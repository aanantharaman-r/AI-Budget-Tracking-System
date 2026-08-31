import { useState } from 'react'
import { Search, LogIn, UserPlus, Wallet } from 'lucide-react'
import { useBudget } from '../../context/BudgetContext'
import AuthModal from '../auth/AuthModal'

export default function Topbar({ pageTitle, query, setQuery, showToast, onNavigate }) {
  const { profile, isLoggedIn, logout } = useBudget()
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md shadow-emerald-500/20">
            <Wallet size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-slate-100 sm:text-xl">{pageTitle}</h1>
          <p className="hidden text-xs text-ink-3 sm:block">{today}</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {pageTitle === 'Transactions' && (
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions…"
                className="input w-64 pl-9 py-2"
              />
            </div>
          )}

          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className="flex items-center gap-2 rounded-xl border border-line bg-card py-1.5 pl-1.5 pr-3 transition hover:bg-card-2"
            title="Manage profile & photo in settings"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile?.name || 'User Avatar'}
                className="h-8 w-8 rounded-lg object-cover ring-2 ring-emerald-500/30"
              />
            ) : (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${profile?.avatarColor || 'from-emerald-400 to-cyan-500'} text-xs font-bold text-white`}
              >
                {(profile?.name || 'Guest User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-100">{isLoggedIn ? profile.name : 'Guest User'}</span>
              <span className="block text-[10px] text-ink-3">{isLoggedIn ? profile.role : 'Logged Out'}</span>
            </span>
          </button>

          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthModal({ open: true, mode: 'login' })}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-card-2"
                title="Log in to account"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Log In</span>
              </button>

              <button
                onClick={() => setAuthModal({ open: true, mode: 'register' })}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:opacity-90"
                title="Register new account"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal((m) => ({ ...m, open: false }))}
        showToast={showToast}
      />
    </header>
  )
}
