/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
