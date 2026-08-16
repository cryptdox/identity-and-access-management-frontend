import {
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} from '@/api/endpoints/group.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { CreateGroupDto, UpdateGroupDto } from '@/features/groups/group.types'

export function useGroupMutations() {
  const toast = useToast()
  const [createGroupMutation, createState] = useCreateGroupMutation()
  const [updateGroupMutation, updateState] = useUpdateGroupMutation()
  const [deleteGroupMutation, deleteState] = useDeleteGroupMutation()

  const createGroup = async (body: CreateGroupDto) => {
    try {
      const result = await createGroupMutation(body).unwrap()
      toast.success('Group created')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create group'))
      throw err
    }
  }

  const updateGroup = async (groupId: string, body: UpdateGroupDto) => {
    try {
      const result = await updateGroupMutation({ groupId, body }).unwrap()
      toast.success('Group updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update group'))
      throw err
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {
      await deleteGroupMutation(groupId).unwrap()
      toast.success('Group deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete group'))
      throw err
    }
  }

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
  }
}
