import { Copy } from 'lucide-react'
import { useToast } from '@/common/hooks/useToast'

export interface UserIdentitySummary {
  userId: string
  name?: string
  username: string
  email: string
}

/** Wherever a row only has a userId to show, render this instead of the raw
 * UUID — name ?? username ?? email, with a copy-email button next to it. Falls
 * back to the bare id only if the user row itself is missing (e.g. deleted). */
export function UserIdentity({ user, fallbackId }: { user?: UserIdentitySummary; fallbackId: string }) {
  const toast = useToast()
  const label = user?.name ?? user?.username ?? user?.email ?? fallbackId

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="truncate">{label}</span>
      {user?.email && (
        <button
          type="button"
          title="Copy email"
          aria-label="Copy email"
          onClick={(e) => {
            e.stopPropagation()
            void navigator.clipboard.writeText(user.email)
            toast.success('Email copied')
          }}
          className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text"
        >
          <Copy className="size-3.5" />
        </button>
      )}
    </span>
  )
}
