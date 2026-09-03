import { useState } from 'react'
import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  Target,
  Sparkles,
  Settings,
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-transaction', label: 'Add', icon: PlusCircle },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function MobileBottomNav({ page, setPage }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 block lg:hidden px-2 pb-2 sm:px-4 sm:pb-3 pointer-events-none">
      <div className="mx-auto max-w-md rounded-2xl border border-line/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <nav className="flex items-center justify-between gap-1">
          {navItems.map((item) => {
            const isActive = page === item.id
            const isHovered = hoveredId === item.id
            const isExpanded = isHovered || (hoveredId === null && isActive)
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onTouchStart={() => setHoveredId(item.id)}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-semibold transition-all duration-300 ease-out select-none ${
                  isExpanded
                    ? 'flex-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40 shadow-md shadow-emerald-500/10'
                    : 'text-ink-2 hover:text-slate-100 hover:bg-white/5'
                }`}
                aria-label={item.label}
              >
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform duration-300 ${
                    isExpanded ? 'scale-110 text-emerald-400' : 'scale-100 text-ink-2'
                  }`}
                />

                <div
                  className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${
                    isExpanded ? 'max-w-[110px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'
                  }`}
                >
                  <span className="whitespace-nowrap font-bold text-[11px] sm:text-xs">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                {isActive && !isExpanded && (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
