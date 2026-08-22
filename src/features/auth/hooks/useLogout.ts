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
    // Navigate away from the current (possibly guarded) route BEFORE clearing auth
    // state — dispatching loggedOut() first leaves ProtectedRoute briefly mounted at
    // the old URL with the new "unauthenticated" status, so it fires its own
    // <Navigate to="/login" state={{ from: oldLocation }}> which then overwrites this
    // clean navigation on a later render, stamping a stale `from` onto /login that
    // the next person to log in (possibly a different user) gets redirected back to.
    navigate('/login', { replace: true })
    tokenManager.clear()
    setRememberDevice(false)
    dispatch(authActions.loggedOut())
    dispatch(baseApi.util.resetApiState())
  }

  return { logout, isLoading }
}
