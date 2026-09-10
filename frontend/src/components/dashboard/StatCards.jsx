import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react'
import { fmtMoney } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'
import TransactionModal from '../transactions/TransactionModal'

function StatCard({ label, value, sub, icon: Icon, iconClass, accent, action }) {
  return (
    <div className="card slide-up relative overflow-hidden p-5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl ${accent} opacity-20`} />
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-2">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums text-slate-100">{value}</p>
        {action}
      </div>
      <p className="mt-1 text-xs text-ink-3">{sub}</p>
    </div>
  )
}

export default function StatCards({ showToast }) {
  const { stats, profile, addTransaction } = useBudget()
  const { income, expense, savings, savingsRate } = stats
  const c = profile?.currency || 'INR'

  const [incomeModalOpen, setIncomeModalOpen] = useState(false)

  const handleSaveIncome = (data) => {
    addTransaction(data)
    if (showToast) showToast('Income added successfully')
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Income"
          value={`+${fmtMoney(income, c)}`}
          sub="Sum of recorded income entries"
          icon={TrendingUp}
          iconClass="bg-emerald-500/10 text-emerald-400"
          accent="from-emerald-500 to-cyan-500"
          action={
            <button
              onClick={() => setIncomeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25 active:scale-95 shadow-sm"
              title="Add Income"
            >
              <Plus size={14} /> Add Income
            </button>
          }
        />

        <StatCard
          label="Total Expenses"
          value={`−${fmtMoney(expense, c)}`}
          sub="This month's total spending"
          icon={TrendingDown}
          iconClass="bg-rose-500/10 text-rose-400"
          accent="from-rose-500 to-orange-500"
        />

        <StatCard
          label="Remaining Balance"
          value={fmtMoney(savings, c)}
          sub={`${savingsRate.toFixed(1)}% of income remaining`}
          icon={PiggyBank}
          iconClass="bg-violet-500/10 text-violet-400"
          accent="from-violet-500 to-fuchsia-500"
        />

        <StatCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          sub={income > 0 ? `${fmtMoney(savings, c)} saved of ${fmtMoney(income, c)}` : 'Add income to calculate rate'}
          icon={Percent}
          iconClass="bg-cyan-500/10 text-cyan-400"
          accent="from-cyan-500 to-blue-500"
        />
      </div>

      <TransactionModal
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        initial={{
          type: 'income',
          title: '',
          amount: '',
          categoryId: 'salary',
          date: new Date().toISOString().slice(0, 10),
        }}
        onSave={handleSaveIncome}
      />
    </>
  )
}
