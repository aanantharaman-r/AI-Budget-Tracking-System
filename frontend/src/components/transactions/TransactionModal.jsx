import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import Modal from '../ui/Modal'
import { expenseCategories, incomeCategories } from '../../data/mockData'
import { uid } from '../../lib/utils'

const emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  categoryId: 'food',
  date: new Date().toISOString().slice(0, 10),
}

export default function TransactionModal({ open, onClose, initial, onSave, onDelete }) {
  const editing = !!initial
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        type: initial.type,
        title: initial.title,
        amount: String(initial.amount),
        categoryId: initial.categoryId,
        date: initial.date.slice(0, 10),
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [open, initial])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.title.trim()) return setError('Please add a description.')
    if (!amount || amount <= 0) return setError('Please enter a valid amount greater than 0.')

    onSave({
      id: initial?.id || uid(),
      type: form.type,
      title: form.title.trim(),
      amount: Math.round(amount * 100) / 100,
      categoryId: form.categoryId,
      date: new Date(form.date + 'T12:00:00').toISOString(),
    })
    onClose()
  }

  const typeOptions = [
    { value: 'expense', label: 'Expense', icon: ArrowUpRight, active: 'bg-red-500/10 text-red-400 ring-red-500/30' },
    { value: 'income', label: 'Income', icon: ArrowDownLeft, active: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30' },
  ]

  const cats = form.type === 'expense' ? expenseCategories : incomeCategories

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit transaction' : 'Add transaction'}
      subtitle={editing ? 'Update the details below' : 'Record a new income or expense'}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1.5">
          {typeOptions.map((t) => {
            const Icon = t.icon
            const active = form.type === t.value
            return (
              <button
                type="button"
                key={t.value}
                onClick={() => {
                  set('type', t.value)
                  const first = (t.value === 'expense' ? expenseCategories : incomeCategories)[0]
                  set('categoryId', first.id)
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                  active ? t.active + ' ring-1' : 'text-ink-2 hover:text-slate-100'
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div>
          <label className="label">Description</label>
          <input
            className="input"
            placeholder={form.type === 'expense' ? 'e.g. Groceries at Whole Foods' : 'e.g. Monthly salary'}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount</label>
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
          <div>
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cats.map((c) => {
              const active = form.categoryId === c.id
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => set('categoryId', c.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : 'border-line bg-surface text-slate-300 hover:bg-card-2'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="truncate">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          {editing && (
            <button
              type="button"
              onClick={() => {
                onDelete(initial.id)
                onClose()
              }}
              className="btn-danger"
            >
              Delete
            </button>
          )}
          <div className="ml-auto flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
