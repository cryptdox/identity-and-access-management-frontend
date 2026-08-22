import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from '@/common/components/layout/AppShell'
import { RealmLayout } from '@/common/components/layout/RealmLayout'
import { withPermission, withPermissionOrSelfService } from '@/common/hocs/withPermission'
import { withMasterRealmUser } from '@/common/hocs/withMasterRealmUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import LoginPage from '@/features/auth/pages/LoginPage'
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage'
import ProfilePage from '@/features/auth/pages/ProfilePage'
import HomeRedirect from '@/common/pages/HomeRedirect'
import UnauthorizedPage from '@/common/pages/UnauthorizedPage'
import NotFoundPage from '@/common/pages/NotFoundPage'
import RealmListPage from '@/features/realms/pages/RealmListPage'
import RealmCreatePage from '@/features/realms/pages/RealmCreatePage'
import RealmSettingsPage from '@/features/realms/pages/RealmSettingsPage'
import PackagesPage from '@/features/package/pages/PackagesPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import UserListPage from '@/features/users/pages/UserListPage'
import UserCreatePage from '@/features/users/pages/UserCreatePage'
import UserDetailPage from '@/features/users/pages/UserDetailPage'
import GroupListPage from '@/features/groups/pages/GroupListPage'
import GroupCreatePage from '@/features/groups/pages/GroupCreatePage'
import GroupDetailPage from '@/features/groups/pages/GroupDetailPage'
import RoleListPage from '@/features/roles/pages/RoleListPage'
import RoleCreatePage from '@/features/roles/pages/RoleCreatePage'
import RoleDetailPage from '@/features/roles/pages/RoleDetailPage'
import ClientListPage from '@/features/clients/pages/ClientListPage'
import ClientCreatePage from '@/features/clients/pages/ClientCreatePage'
import ClientDetailPage from '@/features/clients/pages/ClientDetailPage'
import ResourcePermissionMatrixPage from '@/features/resources/pages/ResourcePermissionMatrixPage'
import SessionsPage from '@/features/sessions/pages/SessionsPage'
import RefreshTokensPage from '@/features/tokens/pages/RefreshTokensPage'
import EventsPage from '@/features/events/pages/EventsPage'

// Realm list/create are Master-only on the backend now (realmMiddleware requires
// isMasterRealmUser) — withPermission alone isn't enough since REALM:CREATE/READ_ALL
// is a global grant every tenant admin also has; withMasterRealmUser adds the
// backend's actual restriction so the UI doesn't offer actions that only fail on click.
const GuardedRealmList = withMasterRealmUser(withPermission(RealmListPage, ResourceName.REALM, TypeAction.READ_ALL))
const GuardedRealmCreate = withMasterRealmUser(withPermission(RealmCreatePage, ResourceName.REALM, TypeAction.CREATE))
const GuardedPackages = withMasterRealmUser(withPermission(PackagesPage, ResourceName.PACKAGE, TypeAction.READ_ALL))
const GuardedRealmSettings = withPermission(RealmSettingsPage, ResourceName.REALM, TypeAction.UPDATE)
const GuardedUserList = withPermission(UserListPage, ResourceName.USER, TypeAction.READ_ALL)
const GuardedUserCreate = withPermission(UserCreatePage, ResourceName.USER, TypeAction.CREATE)
const GuardedUserDetail = withPermission(UserDetailPage, ResourceName.USER, TypeAction.READ)
const GuardedGroupList = withPermissionOrSelfService(GroupListPage, ResourceName.GROUP)
const GuardedGroupCreate = withPermission(GroupCreatePage, ResourceName.GROUP, TypeAction.CREATE)
const GuardedGroupDetail = withPermission(GroupDetailPage, ResourceName.GROUP, TypeAction.READ)
const GuardedRoleList = withPermissionOrSelfService(RoleListPage, ResourceName.ROLE)
const GuardedRoleCreate = withPermission(RoleCreatePage, ResourceName.ROLE, TypeAction.CREATE)
const GuardedRoleDetail = withPermission(RoleDetailPage, ResourceName.ROLE, TypeAction.READ)
const GuardedClientList = withPermission(ClientListPage, ResourceName.CLIENT, TypeAction.READ_ALL)
const GuardedClientCreate = withPermission(ClientCreatePage, ResourceName.CLIENT, TypeAction.CREATE)
const GuardedClientDetail = withPermission(ClientDetailPage, ResourceName.CLIENT, TypeAction.READ)
const GuardedResourceMatrix = withPermission(ResourcePermissionMatrixPage, ResourceName.RESOURCE, TypeAction.READ_ALL)
const GuardedSessions = withPermissionOrSelfService(SessionsPage, ResourceName.SESSION)
const GuardedRefreshTokens = withPermissionOrSelfService(RefreshTokensPage, ResourceName.REFRESH_TOKEN)
const GuardedEvents = withPermissionOrSelfService(EventsPage, ResourceName.EVENT)

/**
 * Realm id lives in the URL (/r/:realmId/...) even though the backend itself ignores
 * it — see common/hooks/useRealmId.ts for why. Phases 2-5 add the routes commented
 * below one module at a time; the layout/guard scaffolding here doesn't change.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/realms" element={<GuardedRealmList />} />
          <Route path="/realms/new" element={<GuardedRealmCreate />} />
          <Route path="/packages" element={<GuardedPackages />} />

          <Route path="/r/:realmId" element={<RealmLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<GuardedRealmSettings />} />
            <Route path="users" element={<GuardedUserList />} />
            <Route path="users/new" element={<GuardedUserCreate />} />
            <Route path="users/:userId" element={<GuardedUserDetail />} />
            <Route path="groups" element={<GuardedGroupList />} />
            <Route path="groups/new" element={<GuardedGroupCreate />} />
            <Route path="groups/:groupId" element={<GuardedGroupDetail />} />
            <Route path="roles" element={<GuardedRoleList />} />
            <Route path="roles/new" element={<GuardedRoleCreate />} />
            <Route path="roles/:roleId" element={<GuardedRoleDetail />} />
            <Route path="clients" element={<GuardedClientList />} />
            <Route path="clients/new" element={<GuardedClientCreate />} />
            <Route path="clients/:clientIdInternal" element={<GuardedClientDetail />} />
            <Route path="clients/:clientIdInternal/resources" element={<GuardedResourceMatrix />} />
            <Route path="sessions" element={<GuardedSessions />} />
            <Route path="refresh-tokens" element={<GuardedRefreshTokens />} />
            <Route path="events" element={<GuardedEvents />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
