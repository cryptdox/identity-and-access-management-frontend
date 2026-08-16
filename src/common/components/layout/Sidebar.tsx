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
} from 'lucide-react'
import { cn } from '@/common/utils/cn'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setSidebarCollapsed } from '@/app/preferencesSlice'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useTranslation } from 'react-i18next'

export function Sidebar() {
  const { realmId } = useParams<{ realmId: string }>()
  const collapsed = useAppSelector((state) => state.preferences.sidebarCollapsed)
  const dispatch = useAppDispatch()
  const { t } = useTranslation('common')
  const { isMasterRealmUser } = useCurrentUser()

  const nav = realmId
    ? [
        { to: `/r/${realmId}/dashboard`, label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: `/r/${realmId}/users`, label: t('nav.users'), icon: Users },
        { to: `/r/${realmId}/groups`, label: t('nav.groups'), icon: FolderTree },
        { to: `/r/${realmId}/roles`, label: t('nav.roles'), icon: ShieldCheck },
        { to: `/r/${realmId}/clients`, label: t('nav.clients'), icon: AppWindow },
        { to: `/r/${realmId}/sessions`, label: t('nav.sessions'), icon: Activity },
        { to: `/r/${realmId}/refresh-tokens`, label: t('nav.tokens'), icon: KeyRound },
        { to: `/r/${realmId}/events`, label: t('nav.events'), icon: ScrollText },
        { to: `/r/${realmId}/settings`, label: t('nav.settings'), icon: Settings },
      ]
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Only Master-realm users can browse/manage the realm list itself (backend
            restricts realm create/list-all/delete to isMasterRealmUser) — a tenant
            admin only ever has their own realm, reachable via HomeRedirect already. */}
        {isMasterRealmUser && (
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
