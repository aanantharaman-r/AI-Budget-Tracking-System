import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  generateTransactions,
  initialBudgets,
  mockProfile,
} from '../data/mockData'

import { computeStats } from '../lib/utils'

import { API_URL } from '../config/api'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [transactions, setTransactions] = useState([])

  const [budgets, setBudgets] = useState(initialBudgets)

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('user_profile')
      return saved ? { ...mockProfile, ...JSON.parse(saved) } : mockProfile
    } catch (e) {
      return mockProfile
    }
  })

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true'
  })

  const [loading, setLoading] = useState(true)

  // ========================================
  // Login / Logout
  // ========================================

  const login = useCallback((userData) => {
    setIsLoggedIn(true)
    localStorage.setItem('is_logged_in', 'true')
    if (userData) {
      const updated = {
        ...mockProfile,
        name: userData.name || mockProfile.name,
        email: userData.email || mockProfile.email,
        monthlySalary: userData.monthlySalary ?? mockProfile.monthlySalary,
      }
      setProfile(updated)
      localStorage.setItem('user_profile', JSON.stringify(updated))
    }
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setTransactions([])
    setBudgets([])
    setProfile(mockProfile)
    localStorage.removeItem('is_logged_in')
    localStorage.removeItem('user_profile')
  }, [])

  // Helper to attach User ID header
  const getAuthHeaders = useCallback(() => {
    const userId = profile?.email || profile?.id || 'guest'
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    }
  }, [profile])

  // ========================================
  // Load Data From MongoDB
  // ========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      const userId = profile?.email || profile?.id || 'guest'

      // -------------------------------
      // Load Transactions
      // -------------------------------

      const transactionResponse = await fetch(
        `${API_URL}/api/transactions`,
        {
          headers: {
            'x-user-id': userId,
          },
        }
      )

      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json()

        setTransactions(
          transactionData.map((t) => ({
            id: t.id,
            type: t.type,
            title: t.title,
            amount: Number(t.amount),
            categoryId: t.categoryId,
            date: t.date,
          }))
        )
      } else {
        setTransactions([])
      }

      // -------------------------------
      // Load Budget Data
      // -------------------------------

      const budgetResponse = await fetch(`${API_URL}/api/budget`, {
        headers: {
          'x-user-id': userId,
        },
      })

      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()

        // Salary
        const salaryData = budgetData.find(
          (item) => item.type === 'salary'
        )

        if (salaryData) {
          setProfile((prev) => ({
            ...prev,
            monthlySalary: Number(salaryData.salary) || 0,
          }))
        }

        // Category Budgets
        const categoryBudgets = budgetData
          .filter((item) => item.type === 'category')
          .map((item) => ({
            categoryId: item.categoryId,
            limit: Number(item.limit) || 0,
          }))

        setBudgets(categoryBudgets)
      } else {
        setBudgets([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.email, profile?.id])

  // Load database data when app starts or active user changes
  useEffect(() => {
    if (isLoggedIn) {
      loadData()
    }
  }, [isLoggedIn, loadData])

  // ========================================
  // ADD TRANSACTION
  // ========================================

  const addTransaction = useCallback(async (data) => {
    // Update frontend immediately
    setTransactions((prev) => [data, ...prev])

    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to save transaction'
        )
      }

      console.log(
        'Transaction saved to MongoDB:',
        result.data
      )
    } catch (error) {
      console.error('Transaction Backend Error:', error)

      // Rollback if backend fails
      setTransactions((prev) =>
        prev.filter((t) => t.id !== data.id)
      )
    }
  }, [getAuthHeaders])

  // ========================================
  // UPDATE TRANSACTION
  // ========================================

  const updateTransaction = useCallback(async (id, data) => {
    // Update frontend immediately
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...data,
            }
          : t
      )
    )

    try {
      const response = await fetch(
        `${API_URL}/api/transactions/${id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to update transaction'
        )
      }

      console.log(
        'Transaction updated in MongoDB:',
        result.data
      )
    } catch (error) {
      console.error(
        'Transaction Update Backend Error:',
        error
      )

      // Reload correct data from database
      loadData()
    }
  }, [getAuthHeaders, loadData])

  // ========================================
  // DELETE TRANSACTION
  // ========================================

  const deleteTransaction = useCallback(async (id) => {
    // Update frontend immediately
    setTransactions((prev) =>
      prev.filter((t) => t.id !== id)
    )

    try {
      const response = await fetch(
        `${API_URL}/api/transactions/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to delete transaction'
        )
      }

      console.log(
        'Transaction deleted from MongoDB:',
        id
      )
    } catch (error) {
      console.error(
        'Transaction Delete Backend Error:',
        error
      )

      // Reload data if delete failed
      loadData()
    }
  }, [getAuthHeaders, loadData])

  // ========================================
  // UPDATE CATEGORY BUDGET
  // ========================================

  const updateBudget = useCallback(
    async (categoryId, limit) => {
      const budgetLimit = parseFloat(limit) || 0

      // Update frontend
      setBudgets((prev) =>
        prev.some((b) => b.categoryId === categoryId)
          ? prev.map((b) =>
              b.categoryId === categoryId
                ? {
                    ...b,
                    limit: budgetLimit,
                  }
                : b
            )
          : [
              ...prev,
              {
                categoryId,
                limit: budgetLimit,
              },
            ]
      )

      try {
        const response = await fetch(
          `${API_URL}/api/budget/category`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              categoryId,
              limit: budgetLimit,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to save budget'
          )
        }

        console.log(
          'Category budget saved to MongoDB:',
          data.data
        )
      } catch (error) {
        console.error(
          'Budget Backend Error:',
          error
        )
      }
    },
    [getAuthHeaders]
  )

  // ========================================
  // UPDATE SALARY
  // ========================================

  const updateSalary = useCallback(async (salary) => {
    const salaryAmount = parseFloat(salary) || 0

    // Update frontend
    setProfile((prev) => ({
      ...prev,
      monthlySalary: salaryAmount,
    }))

    try {
      const response = await fetch(
        `${API_URL}/api/budget/salary`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            salary: salaryAmount,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save salary'
        )
      }

      console.log(
        'Salary saved to MongoDB:',
        data.data
      )
    } catch (error) {
      console.error(
        'Salary Backend Error:',
        error
      )
    }
  }, [])

  // ========================================
  // UPDATE PROFILE
  // ========================================

  const updateProfile = useCallback((data) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        ...data,
      }
      try {
        localStorage.setItem('user_profile', JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save user_profile to localStorage:', e)
      }
      return updated
    })
  }, [])

  // ========================================
  // RESET DATA
  // ========================================

  const resetData = useCallback(() => {
    setTransactions([])
    setBudgets([])
    setProfile(mockProfile)
  }, [])

  // ========================================
  // STATISTICS
  // ========================================

  const stats = useMemo(
    () =>
      computeStats(
        transactions,
        new Date(),
        profile?.startingBalance || 0
      ),
    [
      transactions,
      profile?.startingBalance,
    ]
  )

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      profile,
      stats,
      isLoggedIn,
      loading,

      login,
      logout,

      addTransaction,
      updateTransaction,
      deleteTransaction,

      updateBudget,
      updateSalary,

      updateProfile,

      resetData,

      loadData,
    }),
    [
      transactions,
      budgets,
      profile,
      stats,
      isLoggedIn,
      loading,

      login,
      logout,

      addTransaction,
      updateTransaction,
      deleteTransaction,

      updateBudget,
      updateSalary,

      updateProfile,

      resetData,

      loadData,
    ]
  )

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}

// ========================================
// useBudget Hook
// ========================================

export function useBudget() {
  const ctx = useContext(BudgetContext)

  if (!ctx) {
    throw new Error(
      'useBudget must be used within BudgetProvider'
    )
  }

  return ctx
}