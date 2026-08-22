import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useResendVerifyEmailMutation,
} from '@/api/endpoints/auth.api'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'

/** Wraps the generated RTK Query hooks with the toast side effects every mutation in
 * this app wants — components call these, never the raw hooks directly. */
export function useProfileMutations() {
  const toast = useToast()
  const [updateProfileMutation, updateState] = useUpdateProfileMutation()
  const [changePasswordMutation, changePasswordState] = useChangePasswordMutation()
  const [resendVerifyEmailMutation, resendState] = useResendVerifyEmailMutation()

  const updateProfile = async (body: { name?: string }) => {
    try {
      const result = await updateProfileMutation(body).unwrap()
      toast.success('Profile updated')
      return result.data
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'))
      throw err
    }
  }

  const changePassword = async (body: { oldPassword: string; newPassword: string }) => {
    try {
      await changePasswordMutation(body).unwrap()
      toast.success('Password changed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password'))
      throw err
    }
  }

  const resendVerifyEmail = async () => {
    try {
      await resendVerifyEmailMutation().unwrap()
      toast.success('Verification email sent')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send verification email'))
      throw err
    }
  }

  return {
    updateProfile,
    changePassword,
    resendVerifyEmail,
    isUpdating: updateState.isLoading,
    isChangingPassword: changePasswordState.isLoading,
    isResendingVerifyEmail: resendState.isLoading,
  }
}
