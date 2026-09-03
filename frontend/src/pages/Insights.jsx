import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Send,
  Wand2,
  Trash2,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import { useBudget } from '../context/BudgetContext'
import { fmtMoney } from '../lib/format'

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
  const userId = profile.email || 'default'
  const storageKey = `ai_chat_history_${userId}`

  const welcomeMsg = useMemo(() => ({
    role: 'ai',
    text: `Hi ${profile.name}! I am your AI financial assistant powered by Gemini. Your monthly salary is ${fmtMoney(stats.monthlySalary, profile.currency)}, current expenses are ${fmtMoney(stats.expense, profile.currency)}, and remaining balance is ${fmtMoney(stats.savings, profile.currency)}. How can I help you optimize your money today?`,
  }), [profile.name, profile.currency, stats.monthlySalary, stats.expense, stats.savings])

  // Initialize messages instantly from localStorage to prevent chat disappearing when switching sidebar tabs
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Error reading chat history from localStorage:', e)
    }
    return [welcomeMsg]
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Save to localStorage whenever messages update
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (e) {
      console.warn('Error saving chat to localStorage:', e)
    }
  }, [messages, storageKey])

  // Sync latest chat history from MongoDB database on component mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`http://localhost:5000/api/ai/chat/history?userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.history && data.history.length > 0) {
            const formatted = data.history.map((item) => ({
              role: item.role,
              text: item.text,
            }))
            setMessages([welcomeMsg, ...formatted])
          }
        }
      } catch (err) {
        console.warn('Could not load chat history from DB:', err)
      }
    }
    loadHistory()
  }, [userId, welcomeMsg])

  const clearHistory = async () => {
    try {
      localStorage.removeItem(storageKey)
      await fetch('http://localhost:5000/api/ai/chat/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
    } catch (err) {
      console.warn('Failed to clear chat history:', err)
    } finally {
      setMessages([welcomeMsg])
    }
  }

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId }),
      })
      const data = await res.json()

      if (res.ok && data.answer) {
        setMessages((m) => [...m, { role: 'ai', text: data.answer }])
      } else {
        const fallback = generateAiReply(text, stats, profile, transactions)
        setMessages((m) => [...m, { role: 'ai', text: fallback }])
      }
    } catch (err) {
      console.warn('Backend AI API error, using smart fallback:', err)
      const fallback = generateAiReply(text, stats, profile, transactions)
      setMessages((m) => [...m, { role: 'ai', text: fallback }])
    } finally {
      setLoading(false)
    }
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
          <Sparkles size={12} /> Live Gemini AI Active
        </Badge>
      </div>

      <div className="w-full">
        <div className="card flex flex-col w-full shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25">
                <Wand2 size={16} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-100">Budz AI Assistant</h3>
                <p className="text-xs text-ink-3">Gemini AI • Conversation saved to database</p>
              </div>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearHistory}
                title="Clear chat history from database"
                className="flex items-center gap-1 rounded-lg border border-line bg-surface/50 px-2.5 py-1.5 text-xs font-medium text-ink-3 hover:text-red-400 hover:border-red-500/30 transition"
              >
                <Trash2 size={13} /> Clear History
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5" style={{ minHeight: 380, maxHeight: 520 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/10'
                      : 'rounded-bl-md border border-line bg-surface text-slate-200 shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 text-xs text-cyan-400 flex items-center gap-2">
                  <Sparkles size={14} className="animate-spin" /> Thinking & analyzing your finances...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-line px-5 py-4 bg-surface/30">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? 'AI is thinking...' : 'Ask your AI assistant anything about your money…'}
              disabled={loading}
              className="input py-3"
            />
            <button type="submit" disabled={loading} className="btn-primary shrink-0 px-4!" aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
