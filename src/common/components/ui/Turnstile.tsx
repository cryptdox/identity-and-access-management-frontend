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

// Cloudflare's published "always passes" test site key — used until a real one
// is configured via VITE_TURNSTILE_SITE_KEY. Must match the backend's
// TURNSTILE_SECRET_KEY test default (captcha.middleware.ts) for local dev to work.
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ?? '1x00000000000000000000AA'
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
