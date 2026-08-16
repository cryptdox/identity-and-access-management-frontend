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
}

function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions
  onResolve: (value: boolean) => void
}) {
  const [open, setOpen] = useState(true)

  function resolve(value: boolean) {
    setOpen(false)
    // Let Modal's exit animation (~180ms) play before unmounting the root.
    setTimeout(() => onResolve(value), 200)
  }

  return (
    <Modal open={open} onClose={() => resolve(false)} title={options.title} size="sm">
      <p className="text-sm text-text-secondary">{options.message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => resolve(false)}>
          {options.cancelLabel ?? 'Cancel'}
        </Button>
        <Button variant={options.danger ? 'danger' : 'primary'} size="sm" onClick={() => resolve(true)}>
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
