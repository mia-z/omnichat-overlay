<script lang="ts">
    import { TwitchChatSocket } from "$lib/TwitchChatSocket";
    import { onMount } from "svelte";
    import { twitchUserStore } from "$lib/TwitchUser.store";
    import { twitchOAuthStore } from "$lib/TwitchOAuth.store";
    import { WebviewWindow } from "@tauri-apps/api/window";
    import { emit } from "@tauri-apps/api/event";

    const { VITE_OVERLAY_URL } = import.meta.env;

    let twitchSocket: TwitchChatSocket;
    let overlayWindow: WebviewWindow;

    onMount(() => {

    });

    const onOpenChatOverlayClick = () => {
        overlayWindow = new WebviewWindow("overlaywindow", {
            center: true,
            url: VITE_OVERLAY_URL,
            focus: true,
            decorations: true,
            title: "Overlay",
            width: 800,
            height: 900
        });

        if ($twitchUserStore && $twitchOAuthStore) {
            twitchSocket = new TwitchChatSocket($twitchOAuthStore.currentToken.token, $twitchUserStore.display_name);

            twitchSocket.broadcaster.on("privmsg", (payload) => {
                emit("twitch-message", `${payload.tags?.["display-name"]}: ${payload.parameters.message}`);
            });

            overlayWindow.onCloseRequested(() => {
                twitchSocket.broadcaster.removeAllListeners();
                twitchSocket.close();
            });
        }
    }
</script>

<div class={"p-5 w-full h-full flex flex-col"}>
    <button class={"btn btn-base mt-auto"} onclick={() => {
        overlayWindow.setDecorations(false);
    }}>
        toggle window decoration
    </button>
    <button onclick={onOpenChatOverlayClick} class={"btn btn-base mt-auto"}>
        Open Chat overlay
    </button>
</div>