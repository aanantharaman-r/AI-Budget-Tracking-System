import { AlertTriangle, ArrowUpRight, Sparkles, Plus } from 'lucide-react'
import { useBudget } from '../../context/BudgetContext'
import { categoryById } from '../../data/mockData'
import { spentByCategory } from '../../lib/utils'
import { fmtMoney } from '../../lib/format'
import ProgressBar from '../ui/ProgressBar'
import CategoryIcon from '../CategoryIcon'

function budgetColor(ratio) {
  if (ratio >= 1) return 'linear-gradient(90deg,#ef4444,#f97316)'
  if (ratio >= 0.8) return 'linear-gradient(90deg,#f59e0b,#f97316)'
  return 'linear-gradient(90deg,#10b981,#22d3ee)'
}

function BudgetRow({ budget, spent, currency, compact }) {
  const ratio = budget.limit > 0 ? spent / budget.limit : 0
  const cat = categoryById[budget.categoryId]
  const daysLeft = Math.max(1, new Date().getDate())
  const projected = budget.limit > 0 ? (spent / daysLeft) * 30 : 0
  const over = ratio >= 1

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${cat.color}1a` }}
        >
          <CategoryIcon icon={cat.icon} size={16} style={{ color: cat.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium text-slate-100">{cat.name}</p>
            <p className="shrink-0 text-xs text-ink-2">
              <span className={`font-semibold ${over ? 'text-red-400' : ratio >= 0.8 ? 'text-amber-400' : 'text-slate-100'}`}>
                {fmtMoney(spent, currency)}
              </span>{' '}
              / {fmtMoney(budget.limit, currency)}
            </p>
          </div>
          <ProgressBar value={spent} max={budget.limit} color={budgetColor(ratio)} className="mt-2" />
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-3">
            <span className="font-medium">{Math.round(ratio * 100)}% used</span>
            {over ? (
              <span className="flex items-center gap-1 font-semibold text-red-400">
                <AlertTriangle size={11} /> Over by {fmtMoney(spent - budget.limit, currency)}
              </span>
            ) : ratio >= 0.8 ? (
              <span className="font-semibold text-amber-400">
                On track to hit {fmtMoney(projected, currency)} this month
              </span>
            ) : (
              !compact && <span>Projected {fmtMoney(projected, currency)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BudgetProgress({ compact = false, onViewAll, onManage }) {
  const { transactions, budgets, stats, profile } = useBudget()

  const rows = budgets
    .map((b) => ({ ...b, spent: spentByCategory(transactions, b.categoryId) }))
    .sort((a, b) => b.limit - a.limit)

  const alertCount = rows.filter((r) => r.spent / r.limit >= 0.8).length

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-100">Monthly budgets</h2>
          <p className="text-xs text-ink-3">
            {fmtMoney(stats.expense, profile.currency)} spent across {budgets.length} categories
          </p>
        </div>
        {onManage && (
          <button
            onClick={onManage}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Manage <Plus size={13} />
          </button>
        )}
        {!onManage && onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            View all <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      <div className="divide-y divide-line">
        {(compact ? rows.slice(0, 4) : rows).map((r) => (
          <BudgetRow
            key={r.categoryId}
            budget={r}
            spent={r.spent}
            currency={profile.currency}
            compact={compact}
          />
        ))}

        {compact && alertCount > 0 && (
          <div className="flex items-center gap-2 border-t border-amber-500/20 bg-amber-500/5 px-5 py-3 text-xs font-medium text-amber-400">
            <Sparkles size={13} />
            {alertCount} budget{alertCount > 1 ? 's' : ''} need{alertCount === 1 ? 's' : ''} attention this month
          </div>
        )}
      </div>
    </div>
  )
}
