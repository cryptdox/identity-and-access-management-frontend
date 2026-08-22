import { PageHeader } from '@/common/components/ui/PageHeader'
import { Tabs } from '@/common/components/ui/Tabs'
import { PackageDefinitionsTab } from '@/features/package/components/PackageDefinitionsTab'
import { PackageDefinitionLogsTab } from '@/features/package/components/PackageDefinitionLogsTab'
import { AssignedPackagesTab } from '@/features/package/components/AssignedPackagesTab'
import { PackageRequestsTab } from '@/features/package/components/PackageRequestsTab'
import { PackageLogsTab } from '@/features/package/components/PackageLogsTab'

/** The Packages module — Master-only. Pricing catalog, which realm has which
 * plan, every tenant's change requests, and the full lifecycle log, all in
 * one place instead of spread across each realm's own Package tab. */
export default function PackagesPage() {
  return (
    <div>
      <PageHeader title="Packages" description="Pricing catalog, assigned plans, change requests, and the package lifecycle log — across every realm." />

      <Tabs
        items={[
          { key: 'definitions', label: 'Definitions', content: <PackageDefinitionsTab /> },
          { key: 'definition-logs', label: 'Definition logs', content: <PackageDefinitionLogsTab /> },
          { key: 'assigned', label: 'Assigned', content: <AssignedPackagesTab /> },
          { key: 'requests', label: 'Requests', content: <PackageRequestsTab /> },
          { key: 'logs', label: 'Logs', content: <PackageLogsTab /> },
        ]}
      />
    </div>
  )
}
