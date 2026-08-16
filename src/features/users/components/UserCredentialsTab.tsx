import { useState } from 'react'
import { Plus, Trash2, KeyRound } from 'lucide-react'
import {
  useListCredentialsQuery,
  useCreateCredentialMutation,
  useDeleteCredentialMutation,
} from '@/api/endpoints/credential.api'
import { Button } from '@/common/components/ui/Button'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Modal } from '@/common/components/ui/Modal'
import { Badge } from '@/common/components/ui/Badge'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { formatDateTime } from '@/common/utils/formatDate'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { CredentialTypeValue } from '@/features/users/user.types'

const CREDENTIAL_TYPE_OPTIONS = [
  { value: 'PASSWORD', label: 'Password' },
  { value: 'OTP', label: 'One-time password (TOTP)' },
  { value: 'API_KEY', label: 'API key' },
]

export function UserCredentialsTab({ userId }: { userId: string }) {
  const canManage = useCan(ResourceName.CREDENTIAL, TypeAction.CREATE)
  const { data, isLoading } = useListCredentialsQuery({ userId, limit: 100 })
  const [createCredential, { isLoading: isCreating }] = useCreateCredentialMutation()
  const [deleteCredential] = useDeleteCredentialMutation()
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [type, setType] = useState<CredentialTypeValue>('PASSWORD')
  const [password, setPassword] = useState('')

  async function handleAdd() {
    try {
      await createCredential({
        userId,
        type,
        password: type === 'PASSWORD' ? password : undefined,
        secretData: type !== 'PASSWORD' ? {} : undefined,
      }).unwrap()
      toast.success('Credential added')
      setModalOpen(false)
      setPassword('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add credential'))
    }
  }

  async function handleDelete(credentialId: string) {
    const confirmed = await confirm({ message: 'Remove this credential?', confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await deleteCredential({ credentialId, userId }).unwrap()
      toast.success('Credential removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove credential'))
    }
  }

  const credentials = data?.data?.items ?? []

  return (
    <div className="max-w-lg">
      {canManage && (
        <Button size="sm" className="mb-4" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" /> Add credential
        </Button>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : credentials.length === 0 ? (
        <EmptyState title="No credentials" description="This user has no password or MFA credentials set." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {credentials.map((cred) => (
            <div
              key={cred.credentialId}
              className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-text-secondary" />
                <Badge tone="info">{cred.type}</Badge>
                <span className="text-text-secondary">Added {formatDateTime(cred.createdAt)}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleDelete(cred.credentialId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove credential"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add credential" size="sm">
        <div className="flex flex-col gap-3">
          <Select
            label="Type"
            options={CREDENTIAL_TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value as CredentialTypeValue)}
          />
          {type === 'PASSWORD' && (
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          <Button
            loading={isCreating}
            disabled={type === 'PASSWORD' && !password}
            onClick={() => void handleAdd()}
          >
            Add
          </Button>
        </div>
      </Modal>
    </div>
  )
}
