import {
  useCreateRealmMutation,
  useUpdateRealmMutation,
  useDeleteRealmMutation,
  useUpdateRealmSettingsMutation,
} from '@/api/endpoints/realm.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { CreateRealmDto, UpdateRealmDto } from '@/features/realms/realm.types'

/** Wraps the generated RTK Query hooks with the toast side effects every mutation in
 * this app wants — components call these, never the raw useCreateRealmMutation etc.
 * directly (see the api/endpoints vs features/hooks convention). */
export function useRealmMutations() {
  const toast = useToast()
  const [createRealmMutation, createState] = useCreateRealmMutation()
  const [updateRealmMutation, updateState] = useUpdateRealmMutation()
  const [deleteRealmMutation, deleteState] = useDeleteRealmMutation()
  const [updateSettingsMutation, updateSettingsState] = useUpdateRealmSettingsMutation()

  const createRealm = async (body: CreateRealmDto) => {
    try {
      const result = await createRealmMutation(body).unwrap()
      toast.success('Realm created')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create realm'))
      throw err
    }
  }

  const updateRealm = async (realmId: string, body: UpdateRealmDto) => {
    try {
      const result = await updateRealmMutation({ realmId, body }).unwrap()
      toast.success('Realm updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update realm'))
      throw err
    }
  }

  const deleteRealm = async (realmId: string) => {
    try {
      await deleteRealmMutation(realmId).unwrap()
      toast.success('Realm deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete realm'))
      throw err
    }
  }

  const updateRealmSettings = async (realmId: string, body: Record<string, unknown>) => {
    try {
      const result = await updateSettingsMutation({ realmId, body }).unwrap()
      toast.success('Realm settings updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update realm settings'))
      throw err
    }
  }

  return {
    createRealm,
    updateRealm,
    deleteRealm,
    updateRealmSettings,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isUpdatingSettings: updateSettingsState.isLoading,
  }
}
