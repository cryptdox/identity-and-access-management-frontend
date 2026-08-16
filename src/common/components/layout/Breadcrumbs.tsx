import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const location = useLocation()
  const { realmId } = useParams<{ realmId: string }>()

  const segments = location.pathname
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== 'r' && segment !== realmId)

  if (segments.length === 0) return null

  return (
    <nav className="mb-2 flex items-center gap-1.5 text-sm text-text-secondary">
      {realmId && (
        <Link to={`/r/${realmId}/dashboard`} className="hover:text-text">
          {realmId}
        </Link>
      )}
      {segments.map((segment, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5" />
          <span className="capitalize text-text">{segment.replace(/-/g, ' ')}</span>
        </span>
      ))}
    </nav>
  )
}
