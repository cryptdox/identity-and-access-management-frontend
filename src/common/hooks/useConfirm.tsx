import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

/** One house style for every "are you sure?" prompt — wraps react-confirm-alert's
 * customUI so callers just await confirm({...}) and get back a boolean. */
export function useConfirm() {
  return function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      confirmAlert({
        customUI: ({ onClose }) => (
          <div className="animate-fade-in w-[380px] rounded-xl border border-border bg-surface p-5 shadow-lg">
            {options.title && <h3 className="text-base font-semibold text-text">{options.title}</h3>}
            <p className="mt-2 text-sm text-text-secondary">{options.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt"
                onClick={() => {
                  onClose()
                  resolve(false)
                }}
              >
                {options.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
                  options.danger ? 'bg-danger hover:opacity-90' : 'bg-primary hover:opacity-90'
                }`}
                onClick={() => {
                  onClose()
                  resolve(true)
                }}
              >
                {options.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        ),
      })
    })
  }
}
