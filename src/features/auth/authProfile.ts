import { derivePermissionStrings } from '@/common/utils/permissionString'
import type { UserProfileDetailsDto } from './auth.types'
import type { authActions } from './authSlice'

type ProfileLoadedPayload = Parameters<typeof authActions.profileLoaded>[0]

/** Shared by useLogin and AuthBootstrap — both need to turn a GET /auth/me response
 * into the authSlice's profileLoaded payload, deriving flat permission strings from
 * the nested roles[].permissions[] the backend actually returns. */
export function toProfilePayload(details: UserProfileDetailsDto): ProfileLoadedPayload {
  return {
    user: {
      userId: details.userId,
      email: details.email,
      name: details.name,
      isEmailVerified: details.isEmailVerified,
      isMasterRealmUser: details.isMasterRealmUser,
    },
    permissions: derivePermissionStrings(details.roles),
    roles: details.roles,
    groups: details.groups,
  }
}
