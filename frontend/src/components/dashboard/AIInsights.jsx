import { AlertTriangle, Info, Sparkles, Zap, Target } from 'lucide-react'
import Badge from '../ui/Badge'
import { useBudget } from '../../context/BudgetContext'
import { fmtMoney } from '../../lib/format'

export default function AIInsights({ onViewAll }) {
  const { stats, profile } = useBudget()
  const { monthlySalary, income, expense, savings, savingsRate } = stats
  const c = profile.currency

  const dynamicInsights = []

  if (monthlySalary > 0 && expense > monthlySalary) {
    dynamicInsights.push({
      id: 1,
      severity: 'warn',
      title: 'Expenses exceed salary',
      body: `Your total expenses (${fmtMoney(expense, c)}) have exceeded your base monthly salary of ${fmtMoney(monthlySalary, c)}.`,
    })
  } else if (monthlySalary > 0) {
    dynamicInsights.push({
      id: 1,
      severity: 'good',
      title: 'Salary budget status',
      body: `You have spent ${fmtMoney(expense, c)} out of your ${fmtMoney(monthlySalary, c)} monthly salary (${savingsRate.toFixed(1)}% remaining).`,
    })
  }

  if (savings > 0) {
    dynamicInsights.push({
      id: 2,
      severity: 'info',
      title: 'Current Savings Balance',
      body: `You have ${fmtMoney(savings, c)} remaining balance available this month for savings or goals.`,
    })
  } else {
    dynamicInsights.push({
      id: 2,
      severity: 'warn',
      title: 'Zero remaining balance',
      body: `No savings remaining for this month. Consider reviewing expenses or adding income.`,
    })
  }

  const toneConfig = {
    warn: { icon: AlertTriangle, iconBg: 'bg-amber-500/10 text-amber-400', badge: 'Alert', badgeTone: 'warn' },
    info: { icon: Info, iconBg: 'bg-cyan-500/10 text-cyan-400', badge: 'Insight', badgeTone: 'info' },
    good: { icon: Sparkles, iconBg: 'bg-emerald-500/10 text-emerald-400', badge: 'Good', badgeTone: 'good' },
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-400">
            <Sparkles size={16} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-100">AI Insights</h2>
            <p className="text-xs text-ink-3">Live financial summary</p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 sm:flex">
          <Zap size={11} /> Live analysis
        </span>
      </div>

      <div className="divide-y divide-line">
        {dynamicInsights.map((insight) => {
          const cfg = toneConfig[insight.severity]
          const Icon = cfg.icon
          return (
            <div key={insight.id} className="flex gap-3 px-5 py-4">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-100">{insight.title}</p>
                  <Badge tone={cfg.badgeTone}>{cfg.badge}</Badge>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{insight.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      {onViewAll && (
        <div className="border-t border-line px-5 py-3">
          <button
            onClick={onViewAll}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 text-xs font-semibold text-ink-2 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            <Target size={13} /> See all insights & AI suggestions
          </button>
        </div>
      )}
    </div>
  )
}
