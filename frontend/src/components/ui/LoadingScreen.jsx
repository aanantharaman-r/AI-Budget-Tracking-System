import { useEffect, useState } from 'react'
import { Wallet, Sparkles, Database, ShieldCheck, Cpu, Zap, IndianRupee } from 'lucide-react'

const LOADING_STEPS = [
  { threshold: 0, text: 'Initializing Budz AI core...', icon: Cpu },
  { threshold: 25, text: 'Connecting MongoDB Database...', icon: Database },
  { threshold: 50, text: 'Analyzing financial insights...', icon: Sparkles },
  { threshold: 75, text: 'Securing workspace session...', icon: ShieldCheck },
  { threshold: 95, text: 'Finalizing smart dashboard...', icon: Zap },
]

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Smooth progress increment up to 100% over ~2.0s
    const startTime = Date.now()
    const duration = 2000

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(Math.round((elapsed / duration) * 100), 100)
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
      }
    }, 16)

    // Trigger fade-out transition slightly before completion
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2100)

    // Complete loading after exactly 2.3s
    const doneTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2300)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  // Get current active step based on progress
  const currentStep =
    [...LOADING_STEPS].reverse().find((step) => progress >= step.threshold) ||
    LOADING_STEPS[0]
  const StepIcon = currentStep.icon

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b16] text-slate-100 transition-all duration-500 overflow-hidden ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Gradient Light Orbs */}
      <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-500/15 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[120px] animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute h-96 w-96 rounded-full bg-violet-600/10 blur-[140px] animate-ping" style={{ animationDuration: '6s' }} />

      {/* Floating Background Money / Particle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#1f2b47_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Floating Micro Particles */}
      <div className="absolute top-1/4 left-1/5 text-emerald-400/40 animate-bounce" style={{ animationDuration: '3.5s' }}>
        <IndianRupee size={22} />
      </div>
      <div className="absolute bottom-1/3 right-1/5 text-cyan-400/40 animate-bounce" style={{ animationDuration: '4.2s' }}>
        <Sparkles size={20} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-emerald-400/30 animate-pulse" style={{ animationDuration: '2.5s' }}>
        <Zap size={18} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* Animated App Icon with Glowing Spinning Rings */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Rotating Outer Gradient Ring */}
          <div className="absolute -inset-5 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-violet-500 opacity-70 blur-md animate-spin" style={{ animationDuration: '7s' }} />

          {/* Counter-rotating Dashed Ring */}
          <div className="absolute -inset-3 rounded-full border border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />

          {/* Pulsing Backlight Glow */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-80 blur animate-logo-glow" />

          {/* Main Logo Container & Animated Image */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/90 p-3 shadow-2xl shadow-emerald-500/50 ring-2 ring-emerald-400/60 overflow-hidden transform transition hover:scale-105">
            <img 
              src="/icon.png" 
              alt="Budz AI Logo" 
              className="h-full w-full object-contain rounded-full animate-logo-float" 
            />
          </div>
        </div>

        {/* Brand Title with Gradient Effect */}
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Budz <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">AI</span>
        </h1>

        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-emerald-400/90 flex items-center gap-1.5">
          <Sparkles size={13} className="text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
          AI Financial Intelligence
        </p>

        {/* Dynamic Status Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-line bg-card/60 px-4 py-1.5 backdrop-blur-md shadow-inner">
          <StepIcon size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-medium text-slate-200">{currentStep.text}</span>
        </div>

        {/* Neon Progress Bar Container */}
        <div className="mt-6 w-full space-y-2">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900/90 p-0.5 border border-line/80 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 transition-all duration-100 ease-out shadow-lg shadow-emerald-500/60 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer Light Specular Highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-ink-3">
            <span className="text-[11px] text-ink-3">System Boot</span>
            <span className="text-xs font-bold text-emerald-400 tracking-wider">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
