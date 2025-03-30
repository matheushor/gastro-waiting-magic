
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add any other Vite-specific environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Define the __WS_TOKEN__ global so TypeScript knows about it
declare const __WS_TOKEN__: string;
