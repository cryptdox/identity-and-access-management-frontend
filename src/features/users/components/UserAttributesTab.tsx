import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  useListUserAttributesQuery,
  useCreateUserAttributeMutation,
  useDeleteUserAttributeMutation,
} from '@/api/endpoints/userAttribute.api'
import { Button } from '@/common/components/ui/Button'
import { Input } from '@/common/components/ui/Input'
import { Modal } from '@/common/components/ui/Modal'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export function UserAttributesTab({ userId }: { userId: string }) {
  const canManage = useCan(ResourceName.USER_ATTRIBUTE, TypeAction.CREATE)
  const { data, isLoading } = useListUserAttributesQuery({ userId, limit: 100 })
  const [createAttribute, { isLoading: isCreating }] = useCreateUserAttributeMutation()
  const [deleteAttribute] = useDeleteUserAttributeMutation()
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')

  async function handleAdd() {
    try {
      await createAttribute({ userId, name, value }).unwrap()
      toast.success('Attribute added')
      setModalOpen(false)
      setName('')
      setValue('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add attribute'))
    }
  }

  async function handleDelete(userAttributeId: string) {
    const confirmed = await confirm({ message: 'Remove this attribute?', confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await deleteAttribute({ userAttributeId, userId }).unwrap()
      toast.success('Attribute removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove attribute'))
    }
  }

  const attributes = data?.data?.items ?? []

  return (
    <div className="max-w-lg">
      {canManage && (
        <Button size="sm" className="mb-4" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" /> Add attribute
        </Button>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : attributes.length === 0 ? (
        <EmptyState title="No custom attributes" description="Add key-value metadata for this user." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {attributes.map((attr) => (
            <div
              key={attr.userAttributeId}
              className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0"
            >
              <div>
                <span className="font-medium text-text">{attr.name}</span>
                <span className="ml-2 text-text-secondary">{attr.value}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleDelete(attr.userAttributeId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove attribute"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add attribute" size="sm">
        <div className="flex flex-col gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button loading={isCreating} disabled={!name || !value} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      </Modal>
    </div>
  )
}
