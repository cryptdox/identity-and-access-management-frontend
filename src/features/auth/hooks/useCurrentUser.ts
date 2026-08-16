import { useAppSelector } from '@/app/hooks'

export function useCurrentUser() {
  const user = useAppSelector((state) => state.auth.user)
  const roles = useAppSelector((state) => state.auth.roles)
  const groups = useAppSelector((state) => state.auth.groups)
  const permissions = useAppSelector((state) => state.auth.permissions)
  const status = useAppSelector((state) => state.auth.status)

  return { user, roles, groups, permissions, isAuthenticated: status === 'authenticated' }
}
