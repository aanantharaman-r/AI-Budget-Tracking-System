import { Plus } from 'lucide-react'
import StatCards from '../components/dashboard/StatCards'
import CashflowChart from '../components/charts/CashflowChart'
import CategoryDonut from '../components/charts/CategoryDonut'
import DailyUsageBarChart from '../components/charts/DailyUsageBarChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BudgetProgress from '../components/dashboard/BudgetProgress'
import AIInsights from '../components/dashboard/AIInsights'
import TransactionModal from '../components/transactions/TransactionModal'
import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

export default function Dashboard({ showToast, onNavigate }) {
  const { addTransaction } = useBudget()
  const [modalOpen, setModalOpen] = useState(false)

  const handleSave = (data) => {
    addTransaction(data)
    showToast('Transaction added successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Financial overview</h2>
          <p className="mt-1 text-sm text-ink-2">
            Here&apos;s how your money moved this month — and what your AI assistant noticed.
          </p>
        </div>
        <button onClick={() => onNavigate?.('add-transaction')} className="btn-primary">
          <Plus size={16} /> Add transaction
        </button>
      </div>

      <StatCards showToast={showToast} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold text-slate-100">Cash flow</h2>
            <p className="text-xs text-ink-3">Income vs expenses · last 6 months</p>
          </div>
          <div className="p-4 sm:p-5">
            <CashflowChart />
          </div>
        </div>

        <div className="card">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-semibold text-slate-100">Spending breakdown</h2>
            <p className="text-xs text-ink-3">Expenses by category · this month</p>
          </div>
          <div className="p-5">
            <CategoryDonut />
          </div>
        </div>
      </div>

      {/* Daily Money Usage Bar Chart */}
      <div className="card">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-slate-100">Daily money usage</h2>
          <p className="text-xs text-ink-3">Tracking daily spending money vs incoming money</p>
        </div>
        <div className="p-4 sm:p-5">
          <DailyUsageBarChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <BudgetProgress
          compact
          onManage={() => onNavigate?.('budgets')}
          onViewAll={() => onNavigate?.('budgets')}
        />
        <RecentTransactions
          onViewAll={() => onNavigate?.('transactions')}
          showToast={showToast}
        />
        <div className="lg:col-span-2 xl:col-span-1">
          <AIInsights onViewAll={() => onNavigate?.('insights')} />
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
