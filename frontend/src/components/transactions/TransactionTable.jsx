import { Pencil, Trash2 } from 'lucide-react'
import { categoryById } from '../../data/mockData'
import { fmtMoney, fmtDate } from '../../lib/format'
import CategoryIcon from '../CategoryIcon'
import EmptyState from '../ui/EmptyState'

export default function TransactionTable({ transactions, currency, onEdit, onDelete }) {
  const groups = transactions.reduce((acc, t) => {
    const key = fmtDate(t.date)
    acc[key] = acc[key] || []
    acc[key].push(t)
    return acc
  }, {})

  if (transactions.length === 0) {
    return <EmptyState title="No transactions found" body="Try adjusting your search or filters." />
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([date, items]) => {
        const dayTotal = items.reduce((s, t) => (t.type === 'income' ? s + t.amount : s - t.amount), 0)
        return (
          <div key={date}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{date}</p>
              <p className={`text-xs font-medium ${dayTotal >= 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {dayTotal >= 0 ? '+' : '−'}
                {fmtMoney(Math.abs(dayTotal), currency)}
              </p>
            </div>
            <div className="card divide-y divide-line overflow-hidden">
              {items.map((t) => {
                const cat = categoryById[t.categoryId]
                const income = t.type === 'income'
                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${cat.color}1a` }}
                    >
                      <CategoryIcon icon={cat.icon} size={17} style={{ color: cat.color }} />
                      <span className="sr-only">{cat.name}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">{t.title}</p>
                      <p className="truncate text-xs text-ink-2">{cat.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold tabular-nums ${income ? 'text-emerald-400' : 'text-slate-100'}`}>
                        {income ? '+' : '−'}
                        {fmtMoney(t.amount, currency)}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(t)}
                          className="rounded-lg p-1.5 text-ink-3 transition hover:bg-white/10 hover:text-slate-100"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(t.id || t)}
                          className="rounded-lg p-1.5 text-red-400/80 transition hover:bg-red-500/20 hover:text-red-400"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
