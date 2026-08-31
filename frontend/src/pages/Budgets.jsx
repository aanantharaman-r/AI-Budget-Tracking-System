import { useMemo, useState } from 'react'
import { Target, Pencil, Check, AlertTriangle, Plus, Sparkles, X } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { categoryById, expenseCategories, initialBudgets } from '../data/mockData'
import { spentByCategory } from '../lib/utils'
import { fmtMoney } from '../lib/format'
import ProgressBar from '../components/ui/ProgressBar'
import CategoryIcon from '../components/CategoryIcon'
import Badge from '../components/ui/Badge'

function budgetColor(ratio) {
  if (ratio >= 1) return 'linear-gradient(90deg,#ef4444,#f97316)'
  if (ratio >= 0.8) return 'linear-gradient(90deg,#f59e0b,#f97316)'
  return 'linear-gradient(90deg,#10b981,#22d3ee)'
}

function BudgetEditor({ budget, onSave, onClose, currency }) {
  const [limit, setLimit] = useState(String(budget?.limit || '5000'))
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
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-3">
          {currency === 'INR' ? '₹' : '$'}
        </span>
        <input
          type="number"
          min="1"
          step="100"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="input w-32 pl-6 py-1.5 text-xs font-semibold"
          placeholder="e.g. 5000"
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/30"
      >
        <Check size={14} /> Save
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-1.5 text-ink-3 transition hover:bg-white/5 hover:text-slate-100"
      >
        <X size={14} />
      </button>
    </form>
  )
}

export default function Budgets({ showToast }) {
  const { transactions, budgets, profile, updateBudget } = useBudget()
  const [editingId, setEditingId] = useState(null)
  const [addingCategoryId, setAddingCategoryId] = useState(null)

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

  const unbudgetedList = useMemo(
    () => expenseCategories.filter((c) => !budgets.some((b) => b.categoryId === c.id)),
    [budgets],
  )

  const overCount = rows.filter((r) => r.ratio >= 1).length
  const totalBudget = rows.reduce((s, r) => s + r.limit, 0)
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0)

  const handleSave = (categoryId, limit) => {
    updateBudget(categoryId, limit)
    if (showToast) showToast(`Budget set for ${categoryById[categoryId]?.name || 'category'}`)
  }

  const handleApplyRecommended = () => {
    initialBudgets.forEach((ib) => {
      updateBudget(ib.categoryId, ib.limit)
    })
    if (showToast) showToast('Recommended budgets applied!', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            <Target size={14} className="text-emerald-400" /> Total budget
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{fmtMoney(totalBudget, profile.currency)}</p>
          <p className="mt-1 text-xs text-ink-3">Across {budgets.length} active categories</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            <Target size={14} className="text-cyan-400" /> Total Spent
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

      {/* Main Category Budgets List */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-100">Category Budgets</h2>
            <p className="text-xs text-ink-3">Set and manage monthly spending limits per category</p>
          </div>
          <div className="flex items-center gap-2">
            {budgets.length === 0 && (
              <button
                onClick={handleApplyRecommended}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Sparkles size={14} /> Set Recommended Budgets
              </button>
            )}
            <Badge tone="neutral">Monthly</Badge>
          </div>
        </div>

        {/* Empty state when 0 budgets exist */}
        {rows.length === 0 && (
          <div className="px-5 py-10 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <Target size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">No Category Budgets Set Yet</h3>
              <p className="mt-1 max-w-sm mx-auto text-xs text-ink-2">
                Create spending limits for your categories below or click below to apply recommended defaults!
              </p>
            </div>
            <button
              onClick={handleApplyRecommended}
              className="btn-primary py-2.5 px-5 text-xs"
            >
              <Sparkles size={15} /> Apply Recommended Budgets
            </button>
          </div>
        )}

        {/* Active Budgets List */}
        {rows.length > 0 && (
          <div className="divide-y divide-line">
            {rows.map((r) => {
              const cat = categoryById[r.categoryId]
              const editing = editingId === r.categoryId
              return (
                <div key={r.categoryId} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${cat.color}1a` }}
                    >
                      <CategoryIcon icon={cat.icon} size={18} style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-100">{cat.name}</p>
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
                              <span className={`font-bold ${r.ratio >= 1 ? 'text-red-400' : r.ratio >= 0.8 ? 'text-amber-400' : 'text-slate-100'}`}>
                                {fmtMoney(r.spent, profile.currency)}
                              </span>{' '}
                              / {fmtMoney(r.limit, profile.currency)}
                            </p>
                            <button
                              onClick={() => setEditingId(r.categoryId)}
                              className="flex items-center gap-1 rounded-lg border border-line bg-card px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-card-2"
                              aria-label="Edit budget limit"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                      <ProgressBar value={r.spent} max={r.limit} color={budgetColor(r.ratio)} className="mt-2" />
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-3">
                        <span>{Math.round(r.ratio * 100)}% used</span>
                        {r.ratio >= 1 && (
                          <span className="font-semibold text-red-400">
                            Over by {fmtMoney(r.spent - r.limit, profile.currency)}
                          </span>
                        )}
                        {r.ratio >= 0.8 && r.ratio < 1 && (
                          <span className="font-semibold text-amber-400">Approaching limit</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Unbudgeted Categories Section */}
        {unbudgetedList.length > 0 && (
          <div className="border-t border-line px-5 py-4 space-y-3 bg-surface/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2">
              Unbudgeted Categories ({unbudgetedList.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unbudgetedList.map((c) => {
                const isAdding = addingCategoryId === c.id
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-card p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${c.color}1a` }}
                      >
                        <CategoryIcon icon={c.icon} size={15} style={{ color: c.color }} />
                      </div>
                      <span className="truncate text-xs font-medium text-slate-200">{c.name}</span>
                    </div>

                    {isAdding ? (
                      <BudgetEditor
                        budget={{ categoryId: c.id, limit: 5000 }}
                        currency={profile.currency}
                        onSave={(v) => {
                          handleSave(c.id, v)
                          setAddingCategoryId(null)
                        }}
                        onClose={() => setAddingCategoryId(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingCategoryId(c.id)}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        <Plus size={13} /> Set Budget
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
