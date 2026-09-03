import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  Target,
  Sparkles,
  Settings,
} from 'lucide-react'

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ page, setPage }) {

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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 p-1 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/25 overflow-hidden shrink-0">
              <img src="/icon.png" alt="Budz AI Logo" className="h-full w-full object-contain rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Budz <span className="grad-text">AI</span>
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
      </aside>
    </>
  )
}
