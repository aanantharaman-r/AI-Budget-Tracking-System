import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  Target,
  Sparkles,
  Settings,
  Wallet,
  RefreshCcw,
} from 'lucide-react'
import { useBudget } from '../../context/BudgetContext'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: '5' },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ page, setPage }) {
  const { resetData } = useBudget()

  const handleNav = (id) => {
    setPage(id)
  }

  return (
    <>

      <aside
        className={`hidden lg:flex w-64 flex-col border-r border-line bg-card static translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Aura <span className="grad-text">Budget</span>
              </p>
              <p className="text-[11px] text-ink-3">AI-powered finance</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = page === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`nav-link w-full text-left ${
                  active ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' : ''
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mx-3 mb-3 rounded-2xl border border-line bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4">
          <p className="text-xs font-semibold text-emerald-400">Premium plan</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            Unlock unlimited budgets, AI forecasting & bank sync.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-3">Trial · 8 days left</p>
        </div>

        <div className="border-t border-line px-4 py-3">
          <button
            onClick={resetData}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink-2 transition hover:text-slate-100"
          >
            <RefreshCcw size={13} />
            Reset demo data
          </button>
        </div>
      </aside>
    </>
  )
}
