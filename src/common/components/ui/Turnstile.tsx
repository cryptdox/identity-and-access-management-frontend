import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

// Cloudflare's published "always passes" test site key — used for every build
// except a real production one (import.meta.env.PROD, set by `vite build`),
// regardless of whether a real VITE_TURNSTILE_SITE_KEY is configured.
// Mirrors the backend's captcha.middleware.ts, which does the same for
// TURNSTILE_SECRET_KEY based on PHASE — Cloudflare's real bot-detection
// heuristics routinely flag ordinary dev traffic (VPNs, cloud/VM IPs,
// unusual browser fingerprints) as suspicious, which has nothing to do with
// whether the app itself works; real anti-bot protection only matters
// against actual production traffic. These two values are a matched pair.
const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA'
const TURNSTILE_SITE_KEY = import.meta.env.PROD
  ? ((import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? CLOUDFLARE_TEST_SITE_KEY)
  : CLOUDFLARE_TEST_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

let scriptLoadingPromise: Promise<void> | null = null
function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptLoadingPromise) return scriptLoadingPromise
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })
  return scriptLoadingPromise
}

/** Renders Cloudflare's Turnstile widget and reports the resulting token via
 * onVerify — used wherever a form needs a captchaToken in its submit body
 * (LoginForm, RequestRealmForm). Most legitimate users see no visible
 * challenge; the widget solves invisibly and calls back almost immediately. */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true

    void loadTurnstileScript().then(() => {
      if (!mounted || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onVerify,
      })
    })

    return () => {
      mounted = false
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
    // Deliberately runs once per mount — re-rendering the widget on every
    // onVerify identity change would just reset it in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} />
}
