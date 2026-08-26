import { useState } from 'react'
import { useCreateResourcesMutation } from '@/api/endpoints/resource.api'
import { Modal } from '@/common/components/ui/Modal'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { TypeAction, TypeResource } from '@/api/types/enums.types'
import { ResourceActionsPicker } from '@/features/resources/components/ResourceActionsPicker'

const TYPE_OPTIONS = Object.values(TypeResource).map((t) => ({ value: t, label: t }))

export function AddResourceModal({
  open,
  onClose,
  clientId,
}: {
  open: boolean
  onClose: () => void
  clientId: string
}) {
  const [createResources, { isLoading }] = useCreateResourcesMutation()
  const toast = useToast()
  const [name, setName] = useState('')
  const [type, setType] = useState<TypeResource>(TypeResource.API_ENDPOINT)
  const [actions, setActions] = useState<Set<string>>(new Set([TypeAction.READ]))

  async function handleSubmit() {
    try {
      await createResources({
        clientId,
        resources: [{ name, permissions: [{ type, actions: Array.from(actions) }] }],
      }).unwrap()
      toast.success('Resource created')
      setName('')
      setActions(new Set([TypeAction.READ]))
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create resource'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add resource" size="sm">
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
          Create resource
        </Button>
      </div>
    </Modal>
  )
}
