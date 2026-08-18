import { ArrowUpRight } from 'lucide-react'
import { categoryById } from '../../data/mockData'
import { fmtMoney, fmtDate } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'
import CategoryIcon from '../CategoryIcon'
import { useState } from 'react'
import TransactionModal from '../transactions/TransactionModal'
import EmptyState from '../ui/EmptyState'

export default function RecentTransactions({ onViewAll }) {
  const { transactions, profile, updateTransaction, deleteTransaction } = useBudget()
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const recent = transactions.slice(0, 6)

  const openEdit = (t) => {
    setEditing(t)
    setModalOpen(true)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-100">Recent transactions</h2>
          <p className="text-xs text-ink-3">Latest activity</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
        >
          View all <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-line">
        {recent.length === 0 && <EmptyState title="No transactions yet" />}
        {recent.map((t) => {
          const cat = categoryById[t.categoryId]
          const income = t.type === 'income'
          return (
            <button
              key={t.id}
              onClick={() => openEdit(t)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-white/[0.03]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${cat.color}1a` }}
              >
                <CategoryIcon icon={cat.icon} size={16} style={{ color: cat.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">{t.title}</p>
                <p className="text-xs text-ink-3">
                  {cat.name} · {fmtDate(t.date)}
                </p>
              </div>
              <p className={`text-sm font-semibold tabular-nums ${income ? 'text-emerald-400' : 'text-slate-100'}`}>
                {income ? '+' : '−'}
                {fmtMoney(t.amount, profile.currency)}
              </p>
            </button>
          )
        })}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSave={(data) => updateTransaction(editing.id, data)}
        onDelete={(id) => deleteTransaction(id)}
      />
    </div>
  )
}
