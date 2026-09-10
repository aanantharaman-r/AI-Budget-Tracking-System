export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']

// ========================================
// Expense & Income Categories
// ========================================

export const categories = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'utensils',
    color: '#f59e0b',
    type: 'expense',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'car',
    color: '#3b82f6',
    type: 'expense',
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: 'home',
    color: '#8b5cf6',
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    color: '#ec4899',
    type: 'expense',
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'zap',
    color: '#eab308',
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'clapperboard',
    color: '#06b6d4',
    type: 'expense',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'heart-pulse',
    color: '#ef4444',
    type: 'expense',
  },
  {
    id: 'other_expense',
    name: 'Others',
    icon: 'more-horizontal',
    color: '#64748b',
    type: 'expense',
  },
  {
    id: 'salary',
    name: 'Salary',
    icon: 'briefcase',
    color: '#10b981',
    type: 'income',
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: 'laptop',
    color: '#22d3ee',
    type: 'income',
  },
  {
    id: 'investments',
    name: 'Investments',
    icon: 'trending-up',
    color: '#a3e635',
    type: 'income',
  },
  {
    id: 'other_income',
    name: 'Others',
    icon: 'more-horizontal',
    color: '#38bdf8',
    type: 'income',
  },
]

// ========================================
// Category Filters
// ========================================

export const expenseCategories = categories.filter(
  (c) => c.type === 'expense'
)

export const incomeCategories = categories.filter(
  (c) => c.type === 'income'
)

export const categoryById = Object.fromEntries(
  categories.map((c) => [c.id, c])
)

// ========================================
// Default Monthly Budgets
// ========================================

export const initialBudgets = [
  {
    categoryId: 'food',
    limit: 8000,
  },
  {
    categoryId: 'transport',
    limit: 5000,
  },
  {
    categoryId: 'housing',
    limit: 15000,
  },
  {
    categoryId: 'shopping',
    limit: 5000,
  },
  {
    categoryId: 'utilities',
    limit: 3000,
  },
  {
    categoryId: 'entertainment',
    limit: 2000,
  },
  {
    categoryId: 'health',
    limit: 2000,
  },
]

// ========================================
// User Profile
// ========================================

export const mockProfile = {
  name: 'User',
  email: 'user@finance.app',
  avatarUrl: '',
  avatarColor: 'from-emerald-400 to-cyan-500',
  role: 'Personal Account',

  currency: 'INR',

  monthlySalary: 0,

  startingBalance: 0,

  theme: 'dark',

  notifications: {
    budgetAlerts: true,
    monthlySummary: true,
    tips: true,
    marketing: false,
  },
}

// ========================================
// Transactions
// ========================================

export function generateTransactions() {
  return []
}

// ========================================
// AI Insights
// ========================================

export const aiInsights = []