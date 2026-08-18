import { useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownLeft, Calendar, Tag, FileText, IndianRupee } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { expenseCategories, incomeCategories } from '../data/mockData'
import { uid } from '../lib/utils'
import { fmtMoney } from '../lib/format'
import CategoryIcon from '../components/CategoryIcon'
import RecentTransactions from '../components/dashboard/RecentTransactions'

export default function AddTransaction({ showToast, onNavigate }) {
  const { addTransaction, profile } = useBudget()

  const [form, setForm] = useState({
    type: 'expense',
    title: '',
    amount: '',
    categoryId: 'food',
    date: new Date().toISOString().slice(0, 10),
  })

  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.title.trim()) return setError('Please enter a description for the transaction.')
    if (!amount || amount <= 0) return setError('Please enter a valid amount greater than 0.')

    addTransaction({
      id: uid(),
      type: form.type,
      title: form.title.trim(),
      amount: Math.round(amount * 100) / 100,
      categoryId: form.categoryId,
      date: new Date(form.date + 'T12:00:00').toISOString(),
    })

    showToast(`Added ${form.type === 'income' ? 'income' : 'expense'}: ${form.title.trim()}`)

    setForm({
      type: form.type,
      title: '',
      amount: '',
      categoryId: form.categoryId,
      date: new Date().toISOString().slice(0, 10),
    })
    setError('')
  }

  const cats = form.type === 'expense' ? expenseCategories : incomeCategories

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Add New Transaction</h2>
        <p className="mt-1 text-sm text-ink-2">
          Create and record an income or expense transaction to update your live cash flow and balance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    set('type', 'expense')
                    set('categoryId', expenseCategories[0].id)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                    form.type === 'expense'
                      ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30'
                      : 'border border-line bg-surface text-ink-2 hover:text-slate-100'
                  }`}
                >
                  <ArrowUpRight size={17} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set('type', 'income')
                    set('categoryId', incomeCategories[0].id)
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                    form.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'border border-line bg-surface text-ink-2 hover:text-slate-100'
                  }`}
                >
                  <ArrowDownLeft size={17} /> Income
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="label mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-400" /> Description / Title
                </label>
                <input
                  className="input"
                  placeholder={form.type === 'expense' ? 'e.g. Grocery store, Electric bill' : 'e.g. Freelance design, Bonus'}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div>
                <label className="label mb-2 flex items-center gap-1.5">
                  <IndianRupee size={14} className="text-cyan-400" /> Amount ({profile.currency})
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-400" /> Date
              </label>
              <input
                className="input sm:w-1/2"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>

            <div>
              <label className="label mb-2 flex items-center gap-1.5">
                <Tag size={14} className="text-violet-400" /> Select Category
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {cats.map((c) => {
                  const active = form.categoryId === c.id
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => set('categoryId', c.id)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
                        active
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                          : 'border-line bg-surface text-slate-300 hover:bg-card-2'
                      }`}
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: `${c.color}20` }}
                      >
                        <CategoryIcon icon={c.icon} size={14} style={{ color: c.color }} />
                      </span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate?.('transactions')}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6">
                <Plus size={16} /> Save Transaction
              </button>
            </div>
          </form>
        </div>

        <div>
          <RecentTransactions onViewAll={() => onNavigate?.('transactions')} />
        </div>
      </div>
    </div>
  )
}
