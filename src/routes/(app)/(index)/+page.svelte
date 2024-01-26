<script lang="ts">
    import { TwitchChatSocket } from "$lib/TwitchChatSocket";
    import { onMount } from "svelte";
    import { twitchUserStore } from "$lib/TwitchUser.store";
    import { twitchOAuthStore } from "$lib/TwitchOAuth.store";
    import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
    import { emit } from "@tauri-apps/api/event";
    import Icon from "@iconify/svelte";
    import { integrations } from "$lib/Integrations.svelte";
    const { VITE_OVERLAY_URL } = import.meta.env;

    let twitchSocket = $state<TwitchChatSocket>();
    let overlayWindow = $state<WebviewWindow>();
    let overlayOpen = $state(false);

    const setCleanupEvent = async () => {
        if (overlayWindow) {
            overlayWindow.once("tauri://destroyed", () => {
                if (twitchSocket) {
                    twitchSocket.broadcaster.removeAllListeners();
                    twitchSocket.close();
                }
                overlayWindow = undefined;
                overlayOpen = false;
            });
        }
    }

    onMount(async () => {
        overlayWindow = WebviewWindow.getByLabel("overlaywindow") ?? undefined;
        if (overlayWindow) {
            overlayOpen = true;
            await setCleanupEvent();
        }
    });

    const onOpenChatOverlayClick = async () => {
        if (overlayOpen && overlayWindow) {
            await overlayWindow.close();
            return;
        }

        overlayWindow = new WebviewWindow("overlaywindow", {
            url: VITE_OVERLAY_URL,
            //center: true,
            focus: true,
            decorations: false,
            transparent: true,
            title: "Overlay",
            width: 800,
            height: 900,
            resizable: false,
            minimizable: false,
            closable: false,
            maximizable: false
        });

        if ($twitchUserStore && $twitchOAuthStore) {
            twitchSocket = new TwitchChatSocket($twitchOAuthStore.currentToken.token, $twitchUserStore.display_name);

            twitchSocket.broadcaster.on("privmsg", (payload) => {
                emit("twitch-message", `${payload.tags?.["display-name"]}: ${payload.parameters.message}`);
            });
        }

        await setCleanupEvent();
        overlayOpen = true;
    }
    console.log($twitchOAuthStore);
</script>

<div class={"w-full h-full flex flex-col gap-y-3 align-middle"}>
    <div class={"prose select-none mx-auto p-3"}>
        <h3 class={"underline text-magnum-700 font-bold text-center"}>
            Overlay Manager
        </h3>
        <!-- <p class={"text-zinc-200/80 text-center"}>
            Use the below links to connect accounts.
        </p> -->
    </div>
    <div class={"flex-grow flex flex-col p-2 gap-y-2 relative"}>
        {#if !integrations.twitch}
            <div class={"absolute top-1 left-1 bottom-1 right-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-md bg-zinc-900/30 backdrop-blur-[2px] flex flex-col"}>
                <div class={"absolute top-0 left-0 w-full h-2 bg-magnum-700 rounded-t-lg"} />
                <div class={"prose select-none mx-auto p-3"}>
                    <Icon class={"text-magnum-700 mx-auto mt-5"} width={54} icon={"ci:triangle-warning"} />
                    <h3 class={"text-zinc-100/90 m-1 font-bold text-center"}>
                        You don't currently have any integrations.
                    </h3>
                    <p class={"text-zinc-200/80 text-center"}>
                        Go into the 'Accounts and Integrations' tab to begin setting up your accounts.
                    </p>
                </div>
            </div>
        {/if}
        <div class={"flex-grow grid grid-cols-3 grid-flow-row auto-rows-max place-content-end h-full w-full"}>
            <button class={"btn btn-base col-span-1 inline-flex justify-center text-center"} onclick={() => {
                emit("toggle-overlay-lock");
            }}>
                Toggle overlay lock
                <Icon class={"ml-2"} width={22} icon={"ci:lock"} />
            </button>
        </div>
        <button onclick={onOpenChatOverlayClick} class:btn-danger={overlayOpen} class={"btn btn-base"}>
            {#if overlayOpen}
                Close Chat overlay
            {:else}
                Open Chat overlay
            {/if}
        </button>
    </div>
</div>