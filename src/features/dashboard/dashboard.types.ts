export type DashboardRealmScope = 'MASTER' | 'TENANT' | 'BOTH'

/** Mirrors backend `src/utils/dashboardViewMeta.ts` — the fixed list of data a
 * DashboardView can show, driving the "type" dropdown when creating a new view
 * label under a client's "Dashboard views" tab. */
export interface DashboardViewTypeMeta {
  type: string
  label: string
  description: string
  defaultRealmScope: DashboardRealmScope
}

export interface DashboardView {
  dashboardViewId: string
  clientIdInternal: string
  name: string
  type: string
  realmScope: DashboardRealmScope
  createdAt?: string
  updatedAt?: string | null
}

export interface DashboardViewValue {
  kind: 'count' | 'list'
  count?: number
  items?: Array<Record<string, unknown>>
}

export interface DashboardViewWithData extends DashboardView {
  data: DashboardViewValue
}

export interface CreateDashboardViewDto {
  name: string
  type: string
  realmScope?: DashboardRealmScope
}

export interface RoleDashboardView {
  roleId: string
  dashboardViewId: string
  dashboardView?: DashboardView
}
