import { useEffect, useRef } from 'react'

/** Registers the document listener exactly once (not on every render) by keeping the
 * latest callback in a ref rather than in the effect's dependency array — the effect
 * itself never needs to re-run just because the caller passed a new closure. */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null)
  const onOutsideRef = useRef(onOutside)
  onOutsideRef.current = onOutside

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutsideRef.current()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return ref
}
