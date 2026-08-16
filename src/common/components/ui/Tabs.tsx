import { useState, type ReactNode } from 'react'
import { cn } from '@/common/utils/cn'

export interface TabItem {
  key: string
  label: string
  content: ReactNode
}

export function Tabs({ items, defaultKey }: { items: TabItem[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key)
  const activeItem = items.find((item) => item.key === active)

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActive(item.key)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              active === item.key ? 'text-primary' : 'text-text-secondary hover:text-text',
            )}
          >
            {item.label}
            {active === item.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="animate-fade-in pt-4">{activeItem?.content}</div>
    </div>
  )
}
