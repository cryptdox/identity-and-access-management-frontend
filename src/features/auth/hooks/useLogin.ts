import { useLoginMutation, useLazyGetMeQuery } from '@/api/endpoints/auth.api'
import { useAppDispatch } from '@/app/hooks'
import { authActions } from '@/features/auth/authSlice'
import { toProfilePayload } from '@/features/auth/authProfile'
import { tokenManager } from '@/api/tokenManager'
import { setRememberDevice } from '@/features/auth/rememberDeviceFlag'
import type { LoginFormValues } from '@/features/auth/schemas/login.schema'

export function useLogin() {
  const [loginMutation, { isLoading }] = useLoginMutation()
  const [fetchMe] = useLazyGetMeQuery()
  const dispatch = useAppDispatch()

  const login = async (values: LoginFormValues) => {
    const result = await loginMutation({
      code: values.code,
      email: values.email,
      password: values.password,
    }).unwrap()

    if (!result.data) throw new Error('Login response missing data')
    const { accessToken, refreshToken } = result.data

    const rememberDevice = values.rememberDevice ?? false
    tokenManager.set(accessToken)
    // Decides which storage tier app/rootReducer.ts's custom auth storage engine
    // writes to (localStorage vs sessionStorage) — must be set before the persist
    // machinery's next debounced write, so it happens synchronously alongside the
    // dispatch rather than as a side effect of a reducer.
    setRememberDevice(rememberDevice)
    dispatch(authActions.credentialsReceived({ refreshToken, rememberDevice }))

    try {
      const me = await fetchMe().unwrap()
      if (!me.data) throw new Error('Profile response missing data')
      const payload = toProfilePayload(me.data)
      dispatch(authActions.profileLoaded(payload))
      return payload.user
    } catch (err) {
      // Login itself succeeded, but we couldn't fetch the profile that flips
      // auth.status to 'authenticated' — roll back rather than leave the app
      // holding live tokens with no corresponding authenticated UI state.
      tokenManager.clear()
      setRememberDevice(false)
      dispatch(authActions.loggedOut())
      throw err
    }
  }

  return { login, isLoading }
}
