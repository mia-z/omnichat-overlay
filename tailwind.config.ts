import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

export const config: Config = {
    content: [
        "src/**/*.svelte"
    ],    
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1440px",
            },
        },
        extend: {
            spacing: {
                128: "32rem",
                144: "36rem",
                160: "40rem",
                176: "44rem",
                192: "48rem",
                208: "52rem"
            },
            colors: {
                magnum: {
                    "50": "#fff9ed",
                    "100": "#fef2d6",
                    "200": "#fce0ac",
                    "300": "#f9c978",
                    "400": "#f7b155",
                    "500": "#f38d1c",
                    "600": "#e47312",
                    "700": "#bd5711",
                    "800": "#964516",
                    "900": "#793a15",
                    "950": "#411c09",
                },
            },
            fontFamily: {
                "lobster": ["Lobster", "cursive"],
                "open-sans": ["Open Sans", "sans-serif"],
                "arimo": ["Arimo"],
                "roboto": ["Roboto Flex", "sans-serif"],
                "roboto-monospace": ["Roboto Mono", "monospace"],
                "wix-madefor-text": ["Wix Madefor Text", "sans-serif"],
                "nunito": ["Nunito Sans", "sans-serif"],
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        code: {
                            position: "relative",
                            borderRadius: theme("borderRadius.md"),
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        typography,
        plugin(function ({ addVariant, matchUtilities, theme }) {
            addVariant("hocus", ["&:hover", "&:focus"]);
            // Square utility
            matchUtilities(
                {
                    square: (value) => ({
                        width: value,
                        height: value,
                    }),
                },
                { values: theme("spacing") }
                );
            }),
        ],
    };
    
    export default config;
    