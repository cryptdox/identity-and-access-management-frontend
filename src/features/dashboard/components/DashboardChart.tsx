import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { DashboardChartType, DashboardViewValue } from '@/features/dashboard/dashboard.types'

// Rotates through the app's own theme tokens (theme/tokens.css) so charts stay
// consistent with the rest of the UI and adapt automatically between light/dark.
const PALETTE = [
  'var(--tk-primary)',
  'var(--tk-secondary)',
  'var(--tk-success)',
  'var(--tk-warning)',
  'var(--tk-danger)',
  'var(--tk-info)',
]

function formatLabel(label: string): string {
  const d = new Date(label)
  if (Number.isNaN(d.getTime())) return label
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Renders one DashboardView's chart — switches on both the view's chartType
 * (admin's rendering choice) and the data's own kind (timeseries vs breakdown, set
 * by the backend based on view type). A breakdown can render as PIE or BAR; a
 * timeseries can render as any of BAR/LINE/AREA/SCATTER. */
export function DashboardChart({ chartType, data }: { chartType: DashboardChartType; data: DashboardViewValue }) {
  if (data.kind === 'timeseries') {
    const rows = (data.points ?? []).map((p) => ({ label: formatLabel(p.label), value: p.value }))
    return (
      <ResponsiveContainer width="100%" height={220}>
        {chartType === 'LINE' ? (
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tk-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={PALETTE[0]} strokeWidth={2} dot={false} />
          </LineChart>
        ) : chartType === 'AREA' ? (
          <AreaChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tk-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={PALETTE[0]} fill={PALETTE[0]} fillOpacity={0.25} />
          </AreaChart>
        ) : chartType === 'SCATTER' ? (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tk-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} allowDuplicatedCategory={false} />
            <YAxis dataKey="value" allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Scatter data={rows} fill={PALETTE[0]} />
          </ScatterChart>
        ) : (
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tk-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill={PALETTE[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    )
  }

  if (data.kind === 'breakdown') {
    const rows = data.segments ?? []
    if (chartType === 'PIE') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Pie data={rows} dataKey="value" nameKey="label" outerRadius={75} label>
              {rows.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )
    }
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tk-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return null
}
