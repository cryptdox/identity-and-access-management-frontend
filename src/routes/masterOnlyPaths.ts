// Top-level routes gated by withMasterRealmUser in routes.config.tsx (no
// /r/:realmId prefix, so LoginForm.tsx's realm-scoped `from` check never
// catches these). Single source of truth so a new master-only route can't be
// added to routes.config.tsx without this list being updated alongside it —
// this exact drift (a page added to routes.config.tsx but not here) is what
// caused a non-Master account to be bounced through /packages into
// /unauthorized after a Master admin had last browsed it on the same browser.
export const MASTER_ONLY_TOP_LEVEL_PATHS = ['/realms', '/packages'] as const

export function isMasterOnlyTopLevelPath(path: string): boolean {
  return MASTER_ONLY_TOP_LEVEL_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
}
