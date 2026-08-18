import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useEffect } from 'react'

const styles = {
  success: { icon: CheckCircle2, ring: 'border-emerald-500/40', text: 'text-emerald-400' },
  warn: { icon: AlertTriangle, ring: 'border-amber-500/40', text: 'text-amber-400' },
  info: { icon: Info, ring: 'border-cyan-500/40', text: 'text-cyan-400' },
}

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 2600)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const s = styles[toast.tone] || styles.info
  const Icon = s.icon

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={`slide-up flex items-center gap-3 rounded-xl border ${s.ring} bg-card px-4 py-3 shadow-2xl shadow-black/50`}
      >
        <Icon size={18} className={s.text} />
        <p className="text-sm font-medium text-slate-100">{toast.message}</p>
      </div>
    </div>
  )
}
