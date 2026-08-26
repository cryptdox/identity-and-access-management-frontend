import { useEffect, useState } from 'react'
import { useUpdateResourceMutation } from '@/api/endpoints/resource.api'
import { Modal } from '@/common/components/ui/Modal'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { confirm } from '@/common/utils/confirm'
import { TypeResource } from '@/api/types/enums.types'
import { ResourceActionsPicker } from '@/features/resources/components/ResourceActionsPicker'
import type { Resource } from '@/features/resources/resource.types'

const TYPE_OPTIONS = Object.values(TypeResource).map((t) => ({ value: t, label: t }))

export function EditResourceModal({
  resource,
  onClose,
  clientIdInternal,
}: {
  resource: Resource | null
  onClose: () => void
  clientIdInternal: string
}) {
  const [updateResource, { isLoading }] = useUpdateResourceMutation()
  const toast = useToast()
  const [name, setName] = useState('')
  const [type, setType] = useState<TypeResource>(TypeResource.API_ENDPOINT)
  const [actions, setActions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (resource) {
      setName(resource.name)
      setType(resource.type)
      setActions(new Set(resource.actions))
    }
  }, [resource])

  async function handleSubmit() {
    if (!resource) return

    const removedActions = resource.actions.filter((a) => !actions.has(a))
    if (removedActions.length) {
      const confirmed = await confirm({
        title: 'Remove actions',
        message: `Removing ${removedActions.join(', ')} will delete those permissions for "${resource.name}" and revoke them from any role that had them. Continue?`,
        confirmLabel: 'Remove actions',
        danger: true,
      })
      if (!confirmed) return
    }

    try {
      await updateResource({
        resourceId: resource.resourceId,
        clientIdInternal,
        name,
        type,
        actions: Array.from(actions),
      }).unwrap()
      toast.success('Resource updated')
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update resource'))
    }
  }

  return (
    <Modal open={Boolean(resource)} onClose={onClose} title="Edit resource" size="sm">
      <div className="flex flex-col gap-3">
        <Input label="Resource name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Resource type"
          name="type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as TypeResource)}
        />
        <ResourceActionsPicker actions={actions} onChange={setActions} />
        <Button loading={isLoading} disabled={!name || actions.size === 0} onClick={() => void handleSubmit()}>
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
