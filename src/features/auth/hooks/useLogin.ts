import { useLoginMutation, useLazyGetMeQuery } from '@/api/endpoints/auth.api'
import { useAppDispatch } from '@/app/hooks'
import { authActions } from '@/features/auth/authSlice'
import { toProfilePayload } from '@/features/auth/authProfile'
import { tokenManager } from '@/api/tokenManager'
import type { LoginFormValues } from '@/features/auth/schemas/login.schema'

const IAM_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

export function useLogin() {
  const [loginMutation, { isLoading }] = useLoginMutation()
  const [fetchMe] = useLazyGetMeQuery()
  const dispatch = useAppDispatch()

  const login = async (values: LoginFormValues) => {
    const result = await loginMutation({
      realmName: values.realmName,
      clientId: IAM_CLIENT_ID,
      email: values.email,
      password: values.password,
    }).unwrap()

    if (!result.data) throw new Error('Login response missing data')
    const { accessToken, refreshToken } = result.data

    tokenManager.set(accessToken)
    dispatch(
      authActions.credentialsReceived({
        refreshToken,
        rememberDevice: values.rememberDevice ?? false,
      }),
    )

    try {
      const me = await fetchMe().unwrap()
      if (!me.data) throw new Error('Profile response missing data')
      dispatch(authActions.profileLoaded(toProfilePayload(me.data)))
    } catch (err) {
      // Login itself succeeded, but we couldn't fetch the profile that flips
      // auth.status to 'authenticated' — roll back rather than leave the app
      // holding live tokens with no corresponding authenticated UI state.
      tokenManager.clear()
      dispatch(authActions.loggedOut())
      throw err
    }
  }

  return { login, isLoading }
}
