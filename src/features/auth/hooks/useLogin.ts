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

    const me = await fetchMe().unwrap()
    if (me.data) {
      dispatch(authActions.profileLoaded(toProfilePayload(me.data)))
    }
  }

  return { login, isLoading }
}
