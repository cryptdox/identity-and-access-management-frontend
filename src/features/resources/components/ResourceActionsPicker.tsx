import { useState } from 'react'
import { X } from 'lucide-react'
import { TypeAction } from '@/api/types/enums.types'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'

const STANDARD_ACTIONS = Object.values(TypeAction) as string[]

/** Lets a resource's action-type list be edited: the standard CRUD set via
 * checkboxes, plus free-form custom action names as removable chips. Shared
 * by AddResourceModal and EditResourceModal. */
export function ResourceActionsPicker({
  actions,
  onChange,
}: {
  actions: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const [customInput, setCustomInput] = useState('')
  const customActions = Array.from(actions).filter((a) => !STANDARD_ACTIONS.includes(a))

  function toggleStandard(action: string) {
    const next = new Set(actions)
    if (next.has(action)) next.delete(action)
    else next.add(action)
    onChange(next)
  }

  function addCustomAction() {
    const value = customInput.trim().toUpperCase().replace(/\s+/g, '_')
    if (!value || actions.has(value)) {
      setCustomInput('')
      return
    }
    onChange(new Set([...actions, value]))
    setCustomInput('')
  }

  function removeCustomAction(action: string) {
    const next = new Set(actions)
    next.delete(action)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-sm font-medium text-text">Standard actions</p>
        <div className="flex flex-wrap gap-3">
          {STANDARD_ACTIONS.map((action) => (
            <label key={action} className="flex items-center gap-1.5 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={actions.has(action)}
                onChange={() => toggleStandard(action)}
                className="size-4 rounded border-border text-primary focus:ring-primary/30"
              />
              {action}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-text">Custom actions</p>
        {customActions.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {customActions.map((action) => (
              <span
                key={action}
                className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-text-secondary"
              >
                {action}
                <button
                  type="button"
                  onClick={() => removeCustomAction(action)}
                  aria-label={`Remove ${action}`}
                  className="rounded-full hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            name="customAction"
            placeholder="e.g. EXPORT"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomAction()
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addCustomAction}>
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
