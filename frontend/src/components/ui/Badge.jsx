const tones = {
  good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warn: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  neutral: 'bg-white/5 text-slate-300 border-line',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
