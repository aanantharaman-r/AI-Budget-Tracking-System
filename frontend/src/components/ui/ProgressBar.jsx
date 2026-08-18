export default function ProgressBar({ value, max = 100, color, className = '' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/5 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: color || 'linear-gradient(90deg,#10b981,#22d3ee)',
        }}
      />
    </div>
  )
}
