import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/api/endpoints/user.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { CreateUserDto, UpdateUserDto } from '@/features/users/user.types'

export function useUserMutations() {
  const toast = useToast()
  const [createUserMutation, createState] = useCreateUserMutation()
  const [updateUserMutation, updateState] = useUpdateUserMutation()
  const [deleteUserMutation, deleteState] = useDeleteUserMutation()

  const createUser = async (body: CreateUserDto) => {
    try {
      const result = await createUserMutation(body).unwrap()
      toast.success('User created')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create user'))
      throw err
    }
  }

  const updateUser = async (userId: string, body: UpdateUserDto) => {
    try {
      const result = await updateUserMutation({ userId, body }).unwrap()
      toast.success('User updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user'))
      throw err
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserMutation(userId).unwrap()
      toast.success('User deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user'))
      throw err
    }
  }

  return {
    createUser,
    updateUser,
    deleteUser,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
  }
}
