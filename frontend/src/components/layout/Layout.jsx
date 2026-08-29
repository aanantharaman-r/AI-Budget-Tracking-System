import { useState } from 'react'
import { BudgetProvider, useBudget } from '../../context/BudgetContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Dashboard from '../../pages/Dashboard'
import Transactions from '../../pages/Transactions'
import Budgets from '../../pages/Budgets'
import Insights from '../../pages/Insights'
import Settings from '../../pages/Settings'
import LoginPage from '../../pages/LoginPage'
import Toast from '../ui/Toast'

import AddTransaction from '../../pages/AddTransaction'

const titles = {
  dashboard: 'Dashboard',
  'add-transaction': 'Add Transaction',
  transactions: 'Transactions',
  budgets: 'Budgets',
  insights: 'AI Insights',
  settings: 'Settings',
}

function MainLayout() {
  const { isLoggedIn } = useBudget()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, tone = 'success') => setToast({ message, tone })

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage showToast={showToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    )
  }

  const content = {
    dashboard: <Dashboard showToast={showToast} onNavigate={setPage} />,
    'add-transaction': <AddTransaction showToast={showToast} onNavigate={setPage} />,
    transactions: <Transactions showToast={showToast} onNavigate={setPage} />,
    budgets: <Budgets showToast={showToast} />,
    insights: <Insights />,
    settings: <Settings showToast={showToast} />,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar pageTitle={titles[page]} onMenu={() => setSidebarOpen(true)} showToast={showToast} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div key={page} className="fade-in mx-auto max-w-7xl">
            {content[page]}
          </div>
        </main>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default function Layout() {
  return (
    <BudgetProvider>
      <MainLayout />
    </BudgetProvider>
  )
}
