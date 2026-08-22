export type DashboardRealmScope = 'MASTER' | 'TENANT' | 'BOTH'

export type DashboardChartType = 'NUMBER' | 'BAR' | 'LINE' | 'AREA' | 'PIE' | 'SCATTER'

export type DashboardGranularity = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'

/** Mirrors backend `src/utils/dashboardViewMeta.ts` — the fixed list of data a
 * DashboardView can show, driving the "type" dropdown when creating a new view
 * label under a client's "Dashboard views" tab. */
export interface DashboardViewTypeMeta {
  type: string
  label: string
  description: string
  defaultRealmScope: DashboardRealmScope
  defaultChartType: DashboardChartType
  // Whether this type's data depends on the shared dashboard time-range control —
  // *_TIMESERIES types do, plain counts/lists and EVENT_TYPE_BREAKDOWN don't.
  needsTimeRange: boolean
}

export interface DashboardView {
  dashboardViewId: string
  clientIdInternal: string
  name: string
  type: string
  chartType: DashboardChartType
  realmScope: DashboardRealmScope
  createdAt?: string
  updatedAt?: string | null
}

export interface DashboardTimeseriesPoint {
  label: string
  value: number
}

export interface DashboardBreakdownSegment {
  label: string
  value: number
}

export interface DashboardViewValue {
  kind: 'count' | 'list' | 'timeseries' | 'breakdown'
  count?: number
  items?: Array<Record<string, unknown>>
  points?: DashboardTimeseriesPoint[]
  segments?: DashboardBreakdownSegment[]
}

export interface DashboardViewWithData extends DashboardView {
  data: DashboardViewValue
}

export interface CreateDashboardViewDto {
  name: string
  type: string
  chartType?: DashboardChartType
  realmScope?: DashboardRealmScope
}

export interface RoleDashboardView {
  roleId: string
  dashboardViewId: string
  dashboardView?: DashboardView
}

/** The dashboard's shared time-range control — applies only to *_TIMESERIES views
 * (needsTimeRange: true); every other view ignores it. */
export interface DashboardTimeRange {
  from: string
  to: string
  granularity: DashboardGranularity
}
