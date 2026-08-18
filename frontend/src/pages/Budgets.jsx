import { useMemo } from 'react'
import { Target, Pencil, Check, AlertTriangle } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { categoryById, expenseCategories } from '../data/mockData'
import { spentByCategory } from '../lib/utils'
import { fmtMoney } from '../lib/format'
import ProgressBar from '../components/ui/ProgressBar'
import CategoryIcon from '../components/CategoryIcon'
import Badge from '../components/ui/Badge'
import { useState } from 'react'

function budgetColor(ratio) {
  if (ratio >= 1) return 'linear-gradient(90deg,#ef4444,#f97316)'
  if (ratio >= 0.8) return 'linear-gradient(90deg,#f59e0b,#f97316)'
  return 'linear-gradient(90deg,#10b981,#22d3ee)'
}

function BudgetEditor({ budget, onSave, onClose, currency }) {
  const [limit, setLimit] = useState(String(budget.limit))
  const cat = categoryById[budget.categoryId]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const v = parseFloat(limit)
        if (!v || v <= 0) return
        onSave(v)
        onClose()
      }}
      className="flex items-center gap-2"
    >
      <input
        type="number"
        min="0"
        step="10"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        className="input w-28 py-1.5"
        autoFocus
      />
      <button type="submit" className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400 transition hover:bg-emerald-500/25">
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-ink-3 transition hover:bg-white/5 hover:text-slate-100"
      >
        Cancel
      </button>
      <span className="sr-only">{cat.name} budget in {currency}</span>
    </form>
  )
}

export default function Budgets({ showToast }) {
  const { transactions, budgets, profile, updateBudget } = useBudget()
  const [editingId, setEditingId] = useState(null)

  const rows = useMemo(
    () =>
      budgets
        .map((b) => {
          const spent = spentByCategory(transactions, b.categoryId)
          return { ...b, spent, ratio: b.limit > 0 ? spent / b.limit : 0 }
        })
        .sort((a, b) => b.ratio - a.ratio),
    [budgets, transactions],
  )

  const overCount = rows.filter((r) => r.ratio >= 1).length
  const totalBudget = rows.reduce((s, r) => s + r.limit, 0)
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0)

  const handleSave = (categoryId, limit) => {
    updateBudget(categoryId, limit)
    showToast('Budget updated')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            <Target size={14} className="text-emerald-400" /> Total budget
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{fmtMoney(totalBudget, profile.currency)}</p>
          <p className="mt-1 text-xs text-ink-3">Across {budgets.length} categories</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            <Target size={14} className="text-cyan-400" /> Spent
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{fmtMoney(totalSpent, profile.currency)}</p>
          <p className="mt-1 text-xs text-ink-3">
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget used
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            <AlertTriangle size={14} className="text-amber-400" /> Alerts
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{overCount}</p>
          <p className="mt-1 text-xs text-ink-3">Categories over budget this month</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-100">Category budgets</h2>
            <p className="text-xs text-ink-3">Click edit to set monthly spending limits</p>
          </div>
          <Badge tone="neutral">Monthly</Badge>
        </div>

        <div className="divide-y divide-line">
          {rows.map((r) => {
            const cat = categoryById[r.categoryId]
            const editing = editingId === r.categoryId
            return (
              <div key={r.categoryId} className="px-5 py-4">
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
                      {editing ? (
                        <BudgetEditor
                          budget={r}
                          currency={profile.currency}
                          onSave={(v) => handleSave(r.categoryId, v)}
                          onClose={() => setEditingId(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="shrink-0 text-xs text-ink-2">
                            <span className={`font-semibold ${r.ratio >= 1 ? 'text-red-400' : r.ratio >= 0.8 ? 'text-amber-400' : 'text-slate-100'}`}>
                              {fmtMoney(r.spent, profile.currency)}
                            </span>{' '}
                            / {fmtMoney(r.limit, profile.currency)}
                          </p>
                          <button
                            onClick={() => setEditingId(r.categoryId)}
                            className="rounded-lg p-1.5 text-ink-3 transition hover:bg-white/5 hover:text-slate-100"
                            aria-label="Edit budget"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    <ProgressBar value={r.spent} max={r.limit} color={budgetColor(r.ratio)} className="mt-2" />
                    <div className="mt-1.5 text-[11px] text-ink-3">
                      {Math.round(r.ratio * 100)}% used
                      {r.ratio >= 1 && (
                        <span className="ml-2 font-semibold text-red-400">
                          Over by {fmtMoney(r.spent - r.limit, profile.currency)}
                        </span>
                      )}
                      {r.ratio >= 0.8 && r.ratio < 1 && (
                        <span className="ml-2 font-semibold text-amber-400">Approaching limit</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {expenseCategories.some((c) => !budgets.some((b) => b.categoryId === c.id)) && (
          <div className="border-t border-line px-5 py-4">
            <p className="text-xs text-ink-3">
              Unbudgeted categories:{' '}
              {expenseCategories
                .filter((c) => !budgets.some((b) => b.categoryId === c.id))
                .map((c) => c.name)
                .join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
