import { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  Info,
  TrendingDown,
  PiggyBank,
  Send,
  CalendarCheck,
  Wand2,
} from 'lucide-react'
import { aiInsights } from '../data/mockData'
import Badge from '../components/ui/Badge'
import { useBudget } from '../context/BudgetContext'
import { fmtMoney } from '../lib/format'

const toneConfig = {
  warn: { icon: AlertTriangle, iconBg: 'bg-amber-500/10 text-amber-400', badge: 'Alert', badgeTone: 'warn', ring: 'hover:border-amber-500/40' },
  info: { icon: Info, iconBg: 'bg-cyan-500/10 text-cyan-400', badge: 'Insight', badgeTone: 'info', ring: 'hover:border-cyan-500/40' },
  good: { icon: Sparkles, iconBg: 'bg-emerald-500/10 text-emerald-400', badge: 'Success', badgeTone: 'good', ring: 'hover:border-emerald-500/40' },
}

const suggestions = [
  {
    icon: TrendingDown,
    title: 'Reduce food delivery',
    body: 'You ordered delivery 7 times last month. Cooking 2 extra meals a week saves ~₹110/mo.',
    impact: '₹110/mo',
    tone: 'warn',
  },
  {
    icon: CalendarCheck,
    title: 'Re-negotiate internet plan',
    body: 'Your internet bill is 22% above the local average. A 30-minute call could save ₹15/mo.',
    impact: '₹15/mo',
    tone: 'info',
  },
  {
    icon: PiggyBank,
    title: 'Auto-save 10% on payday',
    body: 'Moving 10% to savings right after salary deposits could add ₹4,200/year untouched.',
    impact: '₹4,200/yr',
    tone: 'good',
  },
]

function generateAiReply(userPrompt, stats, profile, transactions) {
  const c = profile.currency || 'INR'
  const sym = c === 'INR' ? '₹' : c === 'USD' ? '$' : `${c} `
  const prompt = userPrompt.toLowerCase()
  const { income, expense, savings, monthlySalary } = stats

  // Check if asking about savings target e.g. "How can I save 2000 this month?"
  const saveMatch = userPrompt.match(/save\s+(?:₹|\$|INR|USD)?\s*(\d+(?:\.\d+)?)/i)

  if (saveMatch || prompt.includes('save') || prompt.includes('target')) {
    const targetAmount = saveMatch ? parseFloat(saveMatch[1]) : 2000
    const neededReduction = targetAmount - savings

    if (savings >= targetAmount) {
      return `Great news! Your current remaining balance is ${fmtMoney(savings, c)}, which already meets your savings goal of ${sym}${targetAmount}. With a monthly salary of ${fmtMoney(monthlySalary, c)} and total expenses of ${fmtMoney(expense, c)}, you're in great shape!`
    }

    if (income <= 0) {
      return `To save ${sym}${targetAmount}, please first set or add your monthly salary/income. Currently your recorded income is ${fmtMoney(0, c)}.`
    }

    // Top spending categories
    const catExpenses = {}
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        catExpenses[t.categoryId] = (catExpenses[t.categoryId] || 0) + t.amount
      }
    })
    const sortedCats = Object.entries(catExpenses).sort((a, b) => b[1] - a[1])

    let advice = `Based on your monthly salary of ${fmtMoney(monthlySalary, c)}, your total income is ${fmtMoney(income, c)} and current expenses are ${fmtMoney(expense, c)} (remaining balance: ${fmtMoney(savings, c)}).\n\nTo save ${sym}${targetAmount} this month, you need to cut spending by ${fmtMoney(neededReduction, c)}:`
    
    if (sortedCats.length > 0) {
      advice += `\n• Look into your top expense area (${sortedCats[0][0]}): currently ${fmtMoney(sortedCats[0][1], c)}.`
      if (sortedCats.length > 1) {
        advice += `\n• Reduce secondary spending on ${sortedCats[1][0]} (${fmtMoney(sortedCats[1][1], c)}).`
      }
    } else {
      advice += `\n• Keep your discretionary spending capped under ${fmtMoney(income - targetAmount, c)} for the month.`
    }

    advice += `\n• Goal budget limit for total expenses: ${fmtMoney(income - targetAmount, c)}.`
    return advice
  }

  if (prompt.includes('salary') || prompt.includes('income')) {
    return `Your monthly base salary is set to ${fmtMoney(monthlySalary, c)} (Total income including extra entries: ${fmtMoney(income, c)}). Total expenses so far are ${fmtMoney(expense, c)}, leaving a balance of ${fmtMoney(savings, c)}.`
  }

  if (prompt.includes('expense') || prompt.includes('spend')) {
    return `Your total expenses this month are ${fmtMoney(expense, c)} out of your ${fmtMoney(income, c)} income. You have ${fmtMoney(savings, c)} remaining.`
  }

  return `Based on your financial data:\n• Monthly Salary: ${fmtMoney(monthlySalary, c)}\n• Total Income: ${fmtMoney(income, c)}\n• Total Expenses: ${fmtMoney(expense, c)}\n• Remaining Balance: ${fmtMoney(savings, c)}\n\nYou are saving ${stats.savingsRate.toFixed(1)}% of your income this month.`
}

export default function Insights() {
  const { stats, profile, transactions } = useBudget()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi ${profile.name}! I am your AI financial assistant. Your monthly salary is ${fmtMoney(stats.monthlySalary, profile.currency)}, current expenses are ${fmtMoney(stats.expense, profile.currency)}, and remaining balance is ${fmtMoney(stats.savings, profile.currency)}. How can I help you optimize your money today?`,
    },
  ])
  const [input, setInput] = useState('')

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const reply = generateAiReply(text, stats, profile, transactions)
    setMessages((m) => [...m, { role: 'user', text }, { role: 'ai', text: reply }])
    setInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Your AI financial analyst</h2>
          <p className="mt-1 text-sm text-ink-2">
            Personalized insights, alerts and savings opportunities generated from your data.
          </p>
        </div>
        <Badge tone="good">
          <Sparkles size={12} /> 5 new insights
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="card flex flex-col lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25">
              <Wand2 size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-slate-100">Aura Assistant</h3>
              <p className="text-xs text-ink-3">Ask anything about your money</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ minHeight: 260, maxHeight: 380 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'rounded-bl-md border border-line bg-surface text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-line px-5 py-3.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI assistant…"
              className="input py-2.5"
            />
            <button type="submit" className="btn-primary shrink-0 px-3.5!" aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-semibold text-slate-100">Optimization suggestions</h3>
            <p className="text-xs text-ink-3">Ranked by potential savings</p>
          </div>
          <div className="divide-y divide-line">
            {suggestions.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="flex gap-3 px-5 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100">{s.title}</p>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                        {s.impact}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-2">{s.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold text-slate-100">All insights</h2>
          <p className="text-xs text-ink-3">Last updated today at 8:00 AM</p>
        </div>
        <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-x">
          {aiInsights.map((insight) => {
            const cfg = toneConfig[insight.severity]
            const Icon = cfg.icon
            return (
              <div key={insight.id} className={`flex gap-3 px-5 py-4 transition ${cfg.ring}`}>
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
      </div>

      <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-center">
        <p className="text-sm text-ink-2">
          AI insights are simulated for this demo.{' '}
          <span className="font-medium text-slate-100">No real data is processed.</span>
        </p>
      </div>
    </div>
  )
}
