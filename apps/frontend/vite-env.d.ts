/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_SERVICE_WORKER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
