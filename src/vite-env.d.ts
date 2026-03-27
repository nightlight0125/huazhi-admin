/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EXPIRE_AT_MS?: string
  readonly VITE_BUILD_TIME_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
