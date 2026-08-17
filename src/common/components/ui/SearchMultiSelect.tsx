import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/common/utils/cn'

export interface SearchMultiSelectOption {
  value: string
  label: string
}

/** Type-to-search picker that accumulates a multi-select instead of committing one
 * value at a time — for assignment lists too large to dump in a plain <select> (the
 * caller is expected to already have limited `options` to a handful of matches, e.g.
 * via a `limit: 10` list query keyed off `query`). Selected items render as removable
 * chips; the dropdown itself only ever shows the caller-provided page of options. */
export function SearchMultiSelect({
  label,
  placeholder = 'Search…',
  query,
  onQueryChange,
  options,
  selected,
  onToggle,
  loading,
}: {
  label?: string
  placeholder?: string
  query: string
  onQueryChange: (value: string) => void
  options: SearchMultiSelectOption[]
  selected: SearchMultiSelectOption[]
  onToggle: (option: SearchMultiSelectOption) => void
  loading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const selectedIds = new Set(selected.map((s) => s.value))

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text">{label}</label>}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span
              key={s.value}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {s.label}
              <button type="button" onClick={() => onToggle(s)} aria-label={`Remove ${s.label}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {open && (
        <div className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-sm text-text-secondary">Searching…</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-text-secondary">No matches</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onToggle(opt)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-alt',
                  selectedIds.has(opt.value) && 'bg-primary/5 text-primary',
                )}
              >
                {opt.label}
                {selectedIds.has(opt.value) && <span className="text-xs">Selected</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
