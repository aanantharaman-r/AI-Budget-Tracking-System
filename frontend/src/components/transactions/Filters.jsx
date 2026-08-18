import { useState } from 'react'
import { Search, ChevronDown, Filter } from 'lucide-react'
import { categories } from '../../data/mockData'
import { useBudget } from '../../context/BudgetContext'

const types = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

export default function Filters({ filters, onChange }) {
  const { profile } = useBudget()
  const [showCategories, setShowCategories] = useState(false)
  const activeCat = categories.find((c) => c.id === filters.category)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search by name, category or amount…"
          className="input pl-10"
        />
      </div>

      <div className="relative flex items-center gap-2">
        <div className="relative flex rounded-xl border border-line bg-card p-1">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ ...filters, type: t.value })}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filters.type === t.value ? 'bg-emerald-500/15 text-emerald-400' : 'text-ink-2 hover:text-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategories((v) => !v)}
            className="chip whitespace-nowrap"
          >
            <Filter size={13} />
            {activeCat ? (
              <>
                <span className="h-2 w-2 rounded-full" style={{ background: activeCat.color }} />
                {activeCat.name}
              </>
            ) : (
              'All categories'
            )}
            <ChevronDown size={13} className={showCategories ? 'rotate-180 transition' : 'transition'} />
          </button>

          {showCategories && (
            <div className="slide-up absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-line bg-card p-2 shadow-2xl shadow-black/50">
              <button
                onClick={() => {
                  onChange({ ...filters, category: 'all' })
                  setShowCategories(false)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  filters.category === 'all' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange({ ...filters, category: c.id })
                    setShowCategories(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                    filters.category === c.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="hidden text-xs text-ink-3 lg:block">
        Currency · {profile.currency}
      </p>
    </div>
  )
}
