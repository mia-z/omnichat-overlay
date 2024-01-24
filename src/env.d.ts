/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TWITCH_CLIENT_ID: string;
    readonly VITE_TWITCH_SECRET: string;
    readonly VITE_TWITCH_REDIRECT: string;
    readonly VITE_OVERLAY_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}