import { TypeAction } from '@/api/types/enums.types'

const STANDARD_ORDER = Object.values(TypeAction) as string[]

/** Standard CRUD actions first (in their usual order), then any custom
 * action names appended alphabetically — used everywhere a resource's
 * actions are rendered as table columns. */
export function sortActions(actions: Iterable<string>): string[] {
  const set = new Set(actions)
  const known = STANDARD_ORDER.filter((a) => set.has(a))
  const custom = Array.from(set)
    .filter((a) => !STANDARD_ORDER.includes(a))
    .sort()
  return [...known, ...custom]
}
