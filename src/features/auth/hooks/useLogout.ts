import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/api/endpoints/auth.api'
import { useAppDispatch } from '@/app/hooks'
import { authActions } from '@/features/auth/authSlice'
import { tokenManager } from '@/api/tokenManager'
import { setRememberDevice } from '@/features/auth/rememberDeviceFlag'
import { baseApi } from '@/api/baseApi'

export function useLogout() {
  const [logoutMutation, { isLoading }] = useLogoutMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await logoutMutation().unwrap()
    } catch {
      // best-effort: still clear local session even if the server call fails
    }
    tokenManager.clear()
    setRememberDevice(false)
    dispatch(authActions.loggedOut())
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }

  return { logout, isLoading }
}
