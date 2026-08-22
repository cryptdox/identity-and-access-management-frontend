import { NavLink, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderTree,
  ShieldCheck,
  AppWindow,
  Activity,
  KeyRound,
  ScrollText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Package,
} from 'lucide-react'
import { cn } from '@/common/utils/cn'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setSidebarCollapsed } from '@/app/preferencesSlice'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { usePermission } from '@/common/hooks/usePermission'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import { useTranslation } from 'react-i18next'

export function Sidebar() {
  const { realmId } = useParams<{ realmId: string }>()
  const collapsed = useAppSelector((state) => state.preferences.sidebarCollapsed)
  const dispatch = useAppDispatch()
  const { t } = useTranslation('common')
  const { user, isMasterRealmUser } = useCurrentUser()
  const { can } = usePermission()
  const lastRealmId = useAppSelector((state) => state.preferences.lastRealmId)
  // On a master-only page (/realms, /packages — no :realmId in the URL), fall
  // back to whichever realm was last browsed, or the user's own home realm, so
  // the realm-scoped nav items (Dashboard, Users, ...) stay visible instead of
  // disappearing just because the current page isn't itself realm-scoped.
  const effectiveRealmId = realmId ?? lastRealmId ?? user?.realmId
  // isMasterRealmUser only means "belongs to the Master realm" — a Master-realm
  // Manager/Viewer/User is still isMasterRealmUser=true but was never granted
  // REALM:READ_ALL (only the ADMIN role gets that), so showing this link to them
  // would be a link that 403s on click. Require both, matching the actual
  // backend guard on GET /realm (realmMiddleware + REALM:READ_ALL).
  const canListRealms = isMasterRealmUser && can(ResourceName.REALM, TypeAction.READ_ALL)
  // Same reasoning — Packages is a Master-only module (its permission grant
  // exists on every realm's ADMIN role too, roles being tied to the shared
  // iam-client, not per-realm), so gate on isMasterRealmUser as well.
  const canViewPackages = isMasterRealmUser && can(ResourceName.PACKAGE, TypeAction.READ_ALL)
  // A master admin can be inside ANY realm's pages, and two realms' ids are
  // indistinguishable UUIDs — surfacing the name here (not just the breadcrumb) is
  // what stops "which realm am I even looking at" mistakes while switching around.
  const { data: realmData } = useGetRealmQuery(realmId ?? '', { skip: !realmId })

  // Each entry mirrors the exact resource+action routes.config.tsx guards that page
  // with — a link the user can't actually use (and would 403/redirect on click) is
  // worse than no link at all, so this list must stay in lockstep with that file.
  const nav = effectiveRealmId
    ? [
        { to: `/r/${effectiveRealmId}/dashboard`, label: t('nav.dashboard'), icon: LayoutDashboard, show: true },
        { to: `/r/${effectiveRealmId}/users`, label: t('nav.users'), icon: Users, show: can(ResourceName.USER, TypeAction.READ_ALL) },
        { to: `/r/${effectiveRealmId}/groups`, label: t('nav.groups'), icon: FolderTree, show: can(ResourceName.GROUP, TypeAction.READ_ALL) || can(ResourceName.GROUP, TypeAction.READ) },
        { to: `/r/${effectiveRealmId}/roles`, label: t('nav.roles'), icon: ShieldCheck, show: can(ResourceName.ROLE, TypeAction.READ_ALL) || can(ResourceName.ROLE, TypeAction.READ) },
        { to: `/r/${effectiveRealmId}/clients`, label: t('nav.clients'), icon: AppWindow, show: can(ResourceName.CLIENT, TypeAction.READ_ALL) },
        { to: `/r/${effectiveRealmId}/sessions`, label: t('nav.sessions'), icon: Activity, show: can(ResourceName.SESSION, TypeAction.READ_ALL) || can(ResourceName.SESSION, TypeAction.READ) },
        { to: `/r/${effectiveRealmId}/refresh-tokens`, label: t('nav.tokens'), icon: KeyRound, show: can(ResourceName.REFRESH_TOKEN, TypeAction.READ_ALL) || can(ResourceName.REFRESH_TOKEN, TypeAction.READ) },
        { to: `/r/${effectiveRealmId}/events`, label: t('nav.events'), icon: ScrollText, show: can(ResourceName.EVENT, TypeAction.READ_ALL) || can(ResourceName.EVENT, TypeAction.READ) },
        { to: `/r/${effectiveRealmId}/settings`, label: t('nav.settings'), icon: Settings, show: can(ResourceName.REALM, TypeAction.UPDATE) },
      ].filter((item) => item.show)
    : []

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-sidebar text-sidebar-text transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <ShieldCheck className="size-4.5" />
        </div>
        {!collapsed && <span className="truncate font-semibold">IAM Console</span>}
      </div>

      {!collapsed && realmId && (
        <div className="mx-3 mb-2 flex items-center gap-1.5 truncate rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
          <Building2 className="size-3.5 shrink-0" />
          <span className="truncate">{realmData?.data?.name ?? 'Realm'}</span>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Only a Master-realm user who was actually granted REALM:READ_ALL (i.e. the
            Master ADMIN role, not every Master-realm account) can browse the realm
            list — everyone else only ever has their own realm, reachable via
            HomeRedirect already. */}
        {canListRealms && (
          <NavLink
            to="/realms"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Building2 className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">All realms</span>}
          </NavLink>
        )}
        {canViewPackages && (
          <NavLink
            to="/packages"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Package className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">Packages</span>}
          </NavLink>
        )}
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="size-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
        className="flex items-center gap-2 px-4 py-4 text-sm text-white/60 transition-colors hover:text-white"
      >
        {collapsed ? <ChevronsRight className="size-4.5" /> : <ChevronsLeft className="size-4.5" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
