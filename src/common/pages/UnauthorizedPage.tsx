import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ShieldOff className="size-8" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-text">Access denied</h1>
        <p className="mt-1 text-sm text-text-secondary">
          You don't have permission to view this page.
        </p>
      </div>
      <Link to="/">
        <Button variant="outline" size="sm">
          Back to home
        </Button>
      </Link>
    </div>
  )
}
