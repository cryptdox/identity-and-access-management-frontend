import { useParams } from 'react-router-dom'

/** Realm id is always read from the URL (/r/:realmId/...), never from redux — this
 * is what makes a bookmarked/shared link resolve to the right realm regardless of
 * whatever realm was last selected in that browser. See routes/routes.config.tsx. */
export function useRealmId(): string {
  const { realmId } = useParams<{ realmId: string }>()
  if (!realmId) {
    throw new Error('useRealmId() called outside a /r/:realmId route')
  }
  return realmId
}
