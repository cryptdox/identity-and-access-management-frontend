import { useEffect, useState, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useRefreshMutation, useLazyGetMeQuery } from '@/api/endpoints/auth.api'
import { authActions } from '@/features/auth/authSlice'
import { toProfilePayload } from '@/features/auth/authProfile'
import { tokenManager } from '@/api/tokenManager'
import { SplashScreen } from '@/common/components/feedback/SplashScreen'

/**
 * Runs once on app boot. If a refresh token survived (only possible when the user
 * checked "remember this device" at login, see authSlice's persist transform), it
 * silently mints a fresh access token and re-derives user/permissions from /auth/me
 * before rendering the app — the in-memory access token and permissions are never
 * resurrected stale from storage, only ever freshly fetched.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const refreshToken = useAppSelector((state) => state.auth.refreshToken)
  const dispatch = useAppDispatch()
  const [refresh] = useRefreshMutation()
  const [fetchMe] = useLazyGetMeQuery()
  const [booting, setBooting] = useState(() => Boolean(refreshToken))

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!refreshToken) {
        setBooting(false)
        return
      }
      try {
        const result = await refresh({ refreshToken }).unwrap()
        if (!result.data) throw new Error('Refresh response missing data')
        if (cancelled) return

        tokenManager.set(result.data.accessToken)
        dispatch(authActions.tokensRotated({ refreshToken: result.data.refreshToken }))

        const me = await fetchMe().unwrap()
        if (cancelled) return
        if (me.data) {
          dispatch(authActions.profileLoaded(toProfilePayload(me.data)))
        }
      } catch {
        dispatch(authActions.sessionExpired())
      } finally {
        if (!cancelled) setBooting(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
    // Deliberately runs once on mount only, against whatever refreshToken redux-persist
    // rehydrated — not re-run on every later rotation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (booting) return <SplashScreen />
  return <>{children}</>
}
