import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRolePermissionsMutation,
} from '@/api/endpoints/role.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { CreateRoleDto, UpdateRoleDto } from '@/features/roles/role.types'

export function useRoleMutations() {
  const toast = useToast()
  const [createRoleMutation, createState] = useCreateRoleMutation()
  const [updateRoleMutation, updateState] = useUpdateRoleMutation()
  const [deleteRoleMutation, deleteState] = useDeleteRoleMutation()
  const [assignPermissionsMutation, assignState] = useAssignRolePermissionsMutation()

  const createRole = async (body: CreateRoleDto) => {
    try {
      const result = await createRoleMutation(body).unwrap()
      toast.success('Role created')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create role'))
      throw err
    }
  }

  const updateRole = async (roleId: string, body: UpdateRoleDto) => {
    try {
      const result = await updateRoleMutation({ roleId, body }).unwrap()
      toast.success('Role updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update role'))
      throw err
    }
  }

  const deleteRole = async (roleId: string) => {
    try {
      await deleteRoleMutation(roleId).unwrap()
      toast.success('Role deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete role'))
      throw err
    }
  }

  const assignPermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      await assignPermissionsMutation({ roleId, permissionIds }).unwrap()
      toast.success('Permissions updated')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update permissions'))
      throw err
    }
  }

  return {
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isAssigningPermissions: assignState.isLoading,
  }
}
