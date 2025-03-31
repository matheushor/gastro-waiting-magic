
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Adding necessary type declarations
declare module 'd3-path';
declare module 'd3-scale';
declare module 'd3-shape';
declare module 'd3-time';
