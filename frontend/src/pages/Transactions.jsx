import { useMemo, useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { useBudget } from '../context/BudgetContext'
import { filterTransactions } from '../lib/utils'
import Filters from '../components/transactions/Filters'
import TransactionTable from '../components/transactions/TransactionTable'
import TransactionModal from '../components/transactions/TransactionModal'
import Badge from '../components/ui/Badge'

export default function Transactions({ showToast, onNavigate }) {
  const { transactions, profile, addTransaction, updateTransaction, deleteTransaction } = useBudget()
  const [filters, setFilters] = useState({ query: '', category: 'all', type: 'all' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  )

  const totalIn = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const openEdit = (t) => {
    setEditing(t)
    setModalOpen(true)
  }

  const openAdd = () => {
    if (onNavigate) {
      onNavigate('add-transaction')
    } else {
      setEditing(null)
      setModalOpen(true)
    }
  }

  const handleSave = (data) => {
    if (editing) {
      updateTransaction(editing.id, data)
      showToast('Transaction updated')
    } else {
      addTransaction(data)
      showToast('Transaction added')
    }
  }

  const handleDelete = (target) => {
    const id = typeof target === 'object' && target !== null ? target.id : target
    deleteTransaction(id)
    showToast('Transaction deleted', 'info')
  }

  const exportCsv = () => {
    const rows = [
      ['Date', 'Title', 'Type', 'Category', 'Amount'],
      ...filtered.map((t) => [
        new Date(t.date).toLocaleDateString('en-US'),
        t.title,
        t.type,
        t.categoryId,
        t.amount,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aura-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{filtered.length} transactions</Badge>
          <Badge tone="good">In {totalIn.toFixed(0)}</Badge>
          <Badge tone="warn">Out {totalOut.toFixed(0)}</Badge>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn-ghost">
            <Download size={15} /> Export
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add transaction
          </button>
        </div>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      <TransactionTable
        transactions={filtered}
        currency={profile.currency}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
