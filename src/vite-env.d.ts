/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_IAM_CLIENT_ID: string
  readonly VITE_DEFAULT_REALM_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
