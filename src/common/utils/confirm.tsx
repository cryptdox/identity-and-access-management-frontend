import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Modal } from '@/common/components/ui/Modal'
import { Button } from '@/common/components/ui/Button'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  // When set, Confirm stays disabled until the user types this exact text —
  // the "type the resource's name to confirm" pattern for the most destructive
  // actions (deleting/disabling a realm, etc.), on top of the plain click-through
  // every other confirm() call in the app already uses.
  confirmationText?: string
}

function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions
  onResolve: (value: boolean) => void
}) {
  const [open, setOpen] = useState(true)
  const [typed, setTyped] = useState('')
  const requiresTyping = options.confirmationText !== undefined
  const canConfirm = !requiresTyping || typed === options.confirmationText

  function resolve(value: boolean) {
    setOpen(false)
    // Let Modal's exit animation (~180ms) play before unmounting the root.
    setTimeout(() => onResolve(value), 200)
  }

  return (
    <Modal open={open} onClose={() => resolve(false)} title={options.title} size="sm">
      <p className="text-sm text-text-secondary">{options.message}</p>
      {requiresTyping && (
        <div className="mt-4">
          <label className="text-sm text-text-secondary">
            Type <span className="font-mono font-medium text-text">{options.confirmationText}</span> to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => resolve(false)}>
          {options.cancelLabel ?? 'Cancel'}
        </Button>
        <Button variant={options.danger ? 'danger' : 'primary'} size="sm" disabled={!canConfirm} onClick={() => resolve(true)}>
          {options.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  )
}

/** One house style for every "are you sure?" prompt, built on the same Modal every
 * other dialog in the app uses. Imperative on purpose — mounts a throwaway React root
 * so callers can `await confirm({...})` from any event handler without threading
 * modal open-state through every call site. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    function cleanup(value: boolean) {
      root.unmount()
      container.remove()
      resolve(value)
    }

    root.render(<ConfirmDialog options={options} onResolve={cleanup} />)
  })
}
