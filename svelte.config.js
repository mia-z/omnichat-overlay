import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocessMeltUI, sequence } from "@melt-ui/pp";

/** @type {import("@sveltejs/kit").Config} */
const config = {
    preprocess: sequence([
        vitePreprocess(),
        preprocessMeltUI() 
    ]),
    kit: {
        adapter: adapter(),
        alias: {
            "$styles": "./src/styles/*",
            "$assets": "./src/styles/assets/*",
            "$components": "./src/components/*"
        }
    },
};

export default config;
