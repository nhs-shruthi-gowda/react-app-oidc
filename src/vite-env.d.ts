/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_ID: string
  readonly VITE_CLIENT_SECRET: string
    readonly VITE_REDIRECT_URI: string
    readonly VITE_OIDC_ISSUER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

