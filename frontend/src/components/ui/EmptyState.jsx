import { SearchX } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', body, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-ink-2">
        <SearchX size={22} />
      </div>
      <p className="font-medium text-slate-200">{title}</p>
      {body && <p className="max-w-xs text-sm text-ink-2">{body}</p>}
      {action}
    </div>
  )
}
