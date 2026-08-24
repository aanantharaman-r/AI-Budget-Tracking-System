import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { generateTransactions, initialBudgets, mockProfile } from '../data/mockData'

import { computeStats } from '../lib/utils'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [transactions, setTransactions] = useState(() => generateTransactions())

  const [budgets, setBudgets] = useState(initialBudgets)

  const [profile, setProfile] = useState(mockProfile)

  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const login = useCallback(() => setIsLoggedIn(true), [])

  const logout = useCallback(() => setIsLoggedIn(false), [])

  const addTransaction = useCallback((data) => {
    setTransactions((prev) => [data, ...prev])
  }, [])

  const updateTransaction = useCallback((id, data) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    )
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateBudget = useCallback((categoryId, limit) => {
    setBudgets((prev) =>
      prev.some((b) => b.categoryId === categoryId)
        ? prev.map((b) =>
            b.categoryId === categoryId ? { ...b, limit } : b
          )
        : [...prev, { categoryId, limit }]
    )
  }, [])

  const resetData = useCallback(() => {
    setTransactions(generateTransactions())
    setBudgets(initialBudgets)
  }, [])

  // ===============================
  // Save Salary to Backend + MongoDB
  // ===============================
  const updateSalary = useCallback(async (salary) => {
    const salaryAmount = parseFloat(salary) || 0

    // Update frontend immediately
    setProfile((prev) => ({
      ...prev,
      monthlySalary: salaryAmount,
    }))

    // Send salary to backend
    try {
      const response = await fetch('http://localhost:5000/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salary: salaryAmount,
          monthlyBudget: 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save salary')
      }

      console.log('Salary saved to MongoDB:', data)
    } catch (error) {
      console.error('Backend Error:', error)
    }
  }, [])

  // ===============================
  // Statistics
  // ===============================
  const stats = useMemo(
    () =>
      computeStats(
        transactions,
        new Date(),
        profile.startingBalance,
        profile.monthlySalary
      ),
    [transactions, profile.startingBalance, profile.monthlySalary]
  )

  // ===============================
  // Context Value
  // ===============================
  const value = useMemo(
    () => ({
      transactions,
      budgets,
      profile,
      stats,
      isLoggedIn,

      login,
      logout,

      addTransaction,
      updateTransaction,
      deleteTransaction,

      updateBudget,

      updateSalary,

      updateProfile: setProfile,

      resetData,
    }),
    [
      transactions,
      budgets,
      profile,
      stats,
      isLoggedIn,
      login,
      logout,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateBudget,
      updateSalary,
      resetData,
    ]
  )

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)

  if (!ctx) {
    throw new Error('useBudget must be used within BudgetProvider')
  }

  return ctx
}