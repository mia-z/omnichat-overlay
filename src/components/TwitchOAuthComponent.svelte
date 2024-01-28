<script lang="ts">
    import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
    import { listen } from "@tauri-apps/api/event";
    import Icon from "@iconify/svelte";
    import { oauthStore, twitchOAuthStore } from "$lib/OAuth.store";
    import { GetTwitchToken, GetTwitchUser, RevokeTwitchToken } from "$lib/TwitchHelpers";
    import { twitchUserStore } from "$lib/TwitchUser.store";
    import { DeleteTwitchOAuthData, SaveTwitchOAuthData } from "$lib/TauriDataStore";
    import { DateTime } from "luxon";
    import { addErrorToast, addSuccessToast } from "./ToastProvider.svelte";
    import { dev } from "$app/environment";
    import { createDialog, melt } from "@melt-ui/svelte";
    import { fade, fly } from "svelte/transition";
    import TwitchLogo from "$assets/TwitchExtrudedWordmarkPurple.png";

    const { VITE_TWITCH_CLIENT_ID, VITE_TWITCH_REDIRECT } = import.meta.env;

    const scopes = [
        "user:read:email",
        "chat:read",
        "chat:edit",
        "user:read:chat",
        "user:bot",
        "channel:bot"
    ];
    const twitchLoginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${VITE_TWITCH_CLIENT_ID}&redirect_uri=${VITE_TWITCH_REDIRECT}&response_type=code&scope=${encodeURIComponent(scopes.join(" "))}&force_verify=${dev}`; // &force_verify=true 

    let loading = $state(false);
    let unlinking = $state(false);

    const {
        elements: {
            trigger,
            overlay,
            content,
            title,
            description,
            close,
            portalled,
        },
        states: { open },
    } = createDialog({
        forceVisible: true,
    });

    const onTwitchLoginClick = async (e: MouseEvent) => {
        try {
            loading = true;
            const oauthWindow = new WebviewWindow("twitchoauth", {
                center: true,
                url: twitchLoginUrl,
                focus: true,
                decorations: true,
                title: "Twitch login",
                width: 800,
                height: 900
            });
            const code: string = await new Promise((resolve, reject) => {
                listen<string>("twitch-oauth-success", async ({ payload }) => {
                    await oauthWindow.close();
                    resolve(payload);
                });

                listen<string>("twitch-oauth-fail", async ({ payload }) => {
                    loading = false;
                    reject(payload);
                });

                oauthWindow.onCloseRequested(() => {
                    reject("User closed window before oauth finished!");
                });

                oauthWindow.once('tauri://error', (e) => {
                    console.log("oauth window error!");
                    console.log(e);
                    loading = false;
                    if (typeof(e) === "string") {
                        addErrorToast(e);
                    } else if (e instanceof Error) {
                        addErrorToast(e.message);
                    } else {
                        reject("Unknown error!");
                    }
                });
            });

            const tokenRes = await GetTwitchToken(code);

            await oauthStore.twitch.updateTwitchOAuthData({ 
                code: code,
                enabled: true,
                currentToken: {
                    token: tokenRes.access_token,
                    refreshToken: tokenRes.refresh_token,
                    expiresIn: tokenRes.expires_in,
                    expiresAt: DateTime.local().plus({ seconds: tokenRes.expires_in }).toSeconds()
                }
            });

            if (!$twitchOAuthStore) {
                throw new Error("Failed to update twitch oauth data");
            }

            await SaveTwitchOAuthData($twitchOAuthStore);

            const twitchUser = await GetTwitchUser($twitchOAuthStore.currentToken.token);

            twitchUserStore.setInitialTwitchUser(twitchUser);

            loading = false;
            addSuccessToast("Successfully logged in with Twitch!")
        } catch (e) {
            console.log(e);
            if (typeof(e) === "string") {
                addErrorToast(e);
            } else if (e instanceof Error) {
                addErrorToast(e.message);
            } else {
                addErrorToast("Unknown error!");
            }
            loading = false;
        } finally {
            //should unlisten to the previous listeners here in the future. memory leak? idk.
        }
    }

    const onUnlinkTwitchClick = async () => {
        unlinking = true;
        try {
            if ($twitchOAuthStore) { //
                await RevokeTwitchToken($twitchOAuthStore.currentToken.token);
                oauthStore.twitch.resetTwitchOAuthData();
                twitchUserStore.resetTwitchUser();
                const deleted = await DeleteTwitchOAuthData();
                if (!deleted) {
                    throw new Error("Failed to delete from tauri store")
                }
            }
        } catch (e) {
            console.log(e);
            if (typeof(e) === "string") {
                addErrorToast(e);
            } else if (e instanceof Error) {
                addErrorToast(e.message);
            } else {
                addErrorToast("Unknown error!");
            }
        } finally {
            $open = false;
            unlinking = false;
        }
    }
</script>

<div class={"flex flex-col justify-center items-center h-full"}>
    <img draggable={"false"} src={TwitchLogo} alt={"Twitch Logo"} class={"mb-5 w-3/5 select-none"} />
    {#if $twitchUserStore}
        <div class={"text-zinc-200 select-none"}>
            Connected as <span class={"font-bold"}>{$twitchUserStore.display_name}</span>
        </div>
    {/if}
    <div>
        <button onclick={onTwitchLoginClick} class={"btn twitch-login flex flex-row relative transition-all"} disabled={loading || !!$twitchUserStore}>
            <Icon icon={"akar-icons:twitch-fill"} class={"mr-2 text-xl text-white"} />
            <div>
                {#if $twitchUserStore}
                    Twitch Connected!
                {:else}
                    Log in with Twitch
                {/if}
            </div>
            {#if loading}
                <Icon icon={"eos-icons:bubble-loading"} class={"ml-2 text-xl text-white"} />
            {/if}
        </button>
    </div>
    {#if $twitchUserStore}
        <div role={"link"} use:melt={$trigger} class={"select-none mt-1 text-xs text-zinc-200/80 hover:underline hover:cursor-pointer"}>
            Unlink account
        </div>
    {/if}
</div>

<div use:melt={$portalled}>
    {#if $open}
        <div use:melt={$overlay} class={"fixed m-3 rounded-lg inset-0 z-50 bg-black/50"} transition:fade={{ duration: 150 }}/>
        <div class={"fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-zinc-800 p-6 shadow-lg"}
            transition:fly={{
                duration: 150,
                y: 8
            }}
            use:melt={$content}
        >
            <h2 use:melt={$title} class={"m-0 text-lg font-bold  text-magnum-700"}>
                Unlink Twitch account
            </h2>
            <button use:melt={$close} aria-label="close" class={"absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full p-1 text-magnum-800 underline hover:bg-magnum-100 focus:shadow-magnum-400"}>
                <Icon icon={"mdi:close"} class={"square-4"} />
            </button>
            <p use:melt={$description} class={"mb-5 mt-2 leading-normal text-zinc-200/90"}>
                Are you sure you want to unlink your Twitch account?
            </p>
            <div class={"flex flex-row w-full justify-end space-x-3"}>
                <button disabled={unlinking} onclick={() => onUnlinkTwitchClick()} class={"btn btn-base"}>
                    {#if unlinking}
                        <Icon icon={"eos-icons:bubble-loading"} class={"text-xl"} />
                    {:else}
                        Unlink
                    {/if}
                </button>
                <button disabled={unlinking} use:melt={$close} class={"btn btn-danger"}>
                    Cancel
                </button>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    button.btn.twitch-login {
        &:active {
            box-shadow: 0 0px 15px var(--twitch-purple-dark);
        }
        &:hover {
            @apply bg-[var(--twitch-purple-dark)];
        }
        &:disabled {
            &:active {
                box-shadow: none;
            }
            @apply bg-[var(--twitch-purple-disabled)];
        }

        @apply bg-[var(--twitch-purple)]  text-zinc-100;
    }
</style>