import { useEffect, useState } from 'react'
import { Wallet, Sparkles } from 'lucide-react'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Smooth progress increment up to 100% over ~1.8s
    const startTime = Date.now()
    const duration = 1800 

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(Math.round((elapsed / duration) * 100), 100)
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
      }
    }, 20)

    // Trigger fade-out transition slightly before 2s mark
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1800)

    // Complete loading after exactly 2s (2000ms)
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f1e] text-slate-100 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-75 blur transition duration-500 animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/40">
            <Wallet size={40} className="text-white animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Aura <span className="grad-text">Budget</span>
        </h1>
        <p className="mt-2 text-sm text-ink-2 flex items-center gap-1.5 font-medium">
          <Sparkles size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          AI-Powered Financial Intelligence
        </p>

        {/* Progress Bar Container */}
        <div className="mt-8 w-64">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5 border border-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 transition-all duration-75 ease-out shadow-lg shadow-emerald-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-ink-3 font-mono">
            <span>Loading workspace...</span>
            <span className="text-emerald-400 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
