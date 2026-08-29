import { useState } from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {!loading && <Layout />}
    </>
  )
}