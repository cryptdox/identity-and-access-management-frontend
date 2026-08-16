import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-surface-alt text-text-secondary">
        <Compass className="size-8" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-text">Page not found</h1>
        <p className="mt-1 text-sm text-text-secondary">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/">
        <Button variant="outline" size="sm">
          Back to home
        </Button>
      </Link>
    </div>
  )
}
