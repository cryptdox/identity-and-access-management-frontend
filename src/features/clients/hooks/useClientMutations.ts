import {
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} from '@/api/endpoints/client.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { CreateClientDto, UpdateClientDto } from '@/features/clients/client.types'

/** Generates a client-side random secret in the same hex format the backend
 * auto-generates on create (crypto.randomBytes(32).toString('hex')) — used for the
 * "rotate secret" action, since there's no dedicated rotate-secret endpoint, only
 * PUT with a new secret value. */
export function generateClientSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function useClientMutations() {
  const toast = useToast()
  const [createClientMutation, createState] = useCreateClientMutation()
  const [updateClientMutation, updateState] = useUpdateClientMutation()
  const [deleteClientMutation, deleteState] = useDeleteClientMutation()

  const createClient = async (body: CreateClientDto) => {
    try {
      const result = await createClientMutation(body).unwrap()
      toast.success('Client created')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create client'))
      throw err
    }
  }

  const updateClient = async (clientIdInternal: string, body: UpdateClientDto) => {
    try {
      const result = await updateClientMutation({ clientIdInternal, body }).unwrap()
      toast.success('Client updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update client'))
      throw err
    }
  }

  const deleteClient = async (clientIdInternal: string) => {
    try {
      await deleteClientMutation(clientIdInternal).unwrap()
      toast.success('Client deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete client'))
      throw err
    }
  }

  const rotateSecret = async (clientIdInternal: string) => {
    try {
      const secret = generateClientSecret()
      const result = await updateClientMutation({ clientIdInternal, body: { secret } }).unwrap()
      toast.success('Secret rotated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to rotate secret'))
      throw err
    }
  }

  return {
    createClient,
    updateClient,
    deleteClient,
    rotateSecret,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
  }
}
