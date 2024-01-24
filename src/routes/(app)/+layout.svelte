<script context="module">
    import { GetTwitchOAuthData, twitchOAuthStore } from "$lib/TwitchOAuth.store";
    import { LoadTwitchOAuthData, LoadYoutubeOAuthData, SaveTwitchOAuthData } from "$lib/TauriDataStore";
    import { GetTwitchUser, RefreshTwitchToken } from "$lib/TwitchHelpers";
    import { twitchUserStore } from "$lib/TwitchUser.store";
    import { DateTime } from "luxon";
    import { addErrorToast, addSuccessToast } from "$components/ToastProvider.svelte";

    const twitchData = await LoadTwitchOAuthData();
    if (twitchData) {
        try {
            console.log(twitchData);

            if (DateTime.local() > DateTime.fromSeconds(twitchData.currentToken.expiresAt)) {
                console.log("token expired, renewing!")
                const refreshedTwitchToken = await RefreshTwitchToken(twitchData.currentToken.refreshToken);

                twitchOAuthStore.updateTwitchOAuthData({
                    code: twitchData.code,
                    currentToken: {
                        token: refreshedTwitchToken.access_token,
                        refreshToken: refreshedTwitchToken.refresh_token,
                        expiresIn: refreshedTwitchToken.expires_in,
                        expiresAt: DateTime.local().plus({ seconds: refreshedTwitchToken.expires_in }).toSeconds()
                    }
                });
            } else {
                twitchOAuthStore.updateTwitchOAuthData(twitchData);
            }
            
            const updatedOAuthData = GetTwitchOAuthData();

            if (!updatedOAuthData) {
                addErrorToast("Failed to update twitch oauth data");
                throw new Error("Failed to update twitch oauth data");
            }

            await SaveTwitchOAuthData(updatedOAuthData);
            
            const twitchUser = await GetTwitchUser(updatedOAuthData.currentToken.token);

            twitchUserStore.setInitialTwitchUser(twitchUser);

            addSuccessToast("Loaded Twitch credentials!");
        } catch (e) {
            addErrorToast("Error when trying to refresh token from loaded data");
            console.log(e);
        }
    }
    
    const youtubeData = await LoadYoutubeOAuthData();
    if (youtubeData) {
        throw new Error("Not implemented!");
    }
</script>

<script lang="ts">
    import Icon from "@iconify/svelte";
    import { appWindow } from "@tauri-apps/api/window";
    import ToastProvider from "$components/ToastProvider.svelte";
    import LayoutSidebar from "$components/LayoutSidebar.svelte";
</script>

<div class={"absolute top-0 left-0 w-screen h-screen flex flex-col p-3"}>
    <div class={"w-full select-none h-7"}>
        <div data-tauri-drag-region class={"bg-zinc-700 w-full h-full rounded-t-lg flex flex-row space-x-1 place-content-end px-2 relative"}>
            <div class={"absolute flex w-full pointer-events-none"}>
                <div class={"m-auto text-slate-200"}>
                    {#await appWindow.title()}
                        Wowee!
                    {:then title} 
                        {title}
                    {/await}
                </div>
            </div>
            <button onclick={() => appWindow.minimize()} class={"h-5 rounded-b rouned-t-none transition-all bg-slate-300 hover:bg-slate-100 active:bg-slate-300"}>
                <Icon icon={"mdi:minimize"} class={"text-magnum-700"} />
            </button>
            <button class={"h-5 rounded-b rouned-t-none bg-slate-300 opacity-40"}>
                <Icon icon={"mdi:maximize"} class={"text-magnum-700"} />
            </button>
            <button onclick={() => appWindow.close()} class={"h-5 peer rounded-b rouned-t-none transition-all bg-slate-300 hover:bg-slate-100 active:bg-slate-300 group"}>
                <Icon icon={"mdi:close"} class={"group-hover:text-red-600 transition-all text-magnum-700"} />
            </button>
        </div>
    </div>
    <div class={"rounded-b-lg shadow-md flex flex-row w-full h-full bg-zinc-800 overflow-hidden"}>
        <div class={"w-[calc(100%-3.5rem)] flex"}>
            <slot />
        </div>
        <LayoutSidebar />
    </div>
</div>

<ToastProvider />

<style lang="scss">
    :root {
        background-color: transparent !important;
        overflow: hidden;
    }
</style>