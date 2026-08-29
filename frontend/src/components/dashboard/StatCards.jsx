import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Pencil, Check } from 'lucide-react'
import { fmtMoney } from '../../lib/format'
import { useBudget } from '../../context/BudgetContext'

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
  const { stats, profile, updateSalary } = useBudget()
  const { balance, income, expense, savings, savingsRate, monthlySalary, otherIncome } = stats
  const c = profile?.currency || 'INR'

  const [editingSalary, setEditingSalary] = useState(false)
  const [salaryVal, setSalaryVal] = useState(String(profile.monthlySalary || 0))

  const handleSalarySave = (e) => {
    e.preventDefault()
    updateSalary(salaryVal)
    setEditingSalary(false)
    if (showToast) showToast('Monthly salary updated')
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Monthly Salary"
        value={
          editingSalary ? (
            <form onSubmit={handleSalarySave} className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="500"
                value={salaryVal}
                onChange={(e) => setSalaryVal(e.target.value)}
                className="input w-28 py-1 text-sm"
                autoFocus
              />
              <button type="submit" className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400">
                <Check size={14} />
              </button>
            </form>
          ) : (
            fmtMoney(monthlySalary, c)
          )
        }
        sub={otherIncome > 0 ? `+${fmtMoney(otherIncome, c)} additional income` : 'Base monthly earnings'}
        icon={Wallet}
        iconClass="bg-emerald-500/10 text-emerald-400"
        accent="from-emerald-500 to-cyan-500"
        action={
          !editingSalary && (
            <button
              onClick={() => {
                setSalaryVal(String(profile.monthlySalary || 0))
                setEditingSalary(true)
              }}
              className="rounded-lg p-1.5 text-ink-3 transition hover:bg-white/5 hover:text-slate-100"
              title="Edit Salary"
            >
              <Pencil size={13} />
            </button>
          )
        }
      />
      <StatCard
        label="Total Income"
        value={`+${fmtMoney(income, c)}`}
        sub="Salary + extra income"
        icon={TrendingUp}
        iconClass="bg-cyan-500/10 text-cyan-400"
        accent="from-cyan-500 to-blue-500"
      />
      <StatCard
        label="Total Expenses"
        value={`−${fmtMoney(expense, c)}`}
        sub="This month's expenses"
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
    </div>
  )
}
