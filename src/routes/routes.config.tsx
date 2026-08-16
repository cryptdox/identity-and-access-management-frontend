import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from '@/common/components/layout/AppShell'
import { RealmLayout } from '@/common/components/layout/RealmLayout'
import { withPermission } from '@/common/hocs/withPermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import LoginPage from '@/features/auth/pages/LoginPage'
import HomeRedirect from '@/common/pages/HomeRedirect'
import UnauthorizedPage from '@/common/pages/UnauthorizedPage'
import NotFoundPage from '@/common/pages/NotFoundPage'
import RealmListPage from '@/features/realms/pages/RealmListPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'

const GuardedRealmList = withPermission(RealmListPage, ResourceName.REALM, TypeAction.READ_ALL)

/**
 * Realm id lives in the URL (/r/:realmId/...) even though the backend itself ignores
 * it — see common/hooks/useRealmId.ts for why. Phases 2-5 add the routes commented
 * below one module at a time; the layout/guard scaffolding here doesn't change.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/realms" element={<GuardedRealmList />} />
          {/* /realms/new -> Phase 2a */}

          <Route path="/r/:realmId" element={<RealmLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            {/* users, groups, roles, clients, sessions, refresh-tokens, events, settings
                are added in Phases 2-5, each wrapped in withPermission(...) here. */}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
