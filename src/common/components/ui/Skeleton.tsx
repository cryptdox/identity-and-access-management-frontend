import { cn } from '@/common/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse-soft rounded-md bg-surface-alt', className)} />
}
