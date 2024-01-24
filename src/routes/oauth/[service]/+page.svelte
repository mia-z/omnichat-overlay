<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { appWindow, getAll, WebviewWindow, LogicalSize } from "@tauri-apps/api/window";
    import Icon from "@iconify/svelte";
    
    let mainWindow: WebviewWindow;
    
    onMount(async () => {
        try {
            await appWindow.setSize(new LogicalSize(800, 600))
            await appWindow.center();
            
            let mainWindowRef = getAll().find(x => x.label === "main");
            if (!mainWindowRef) {
                throw new Error("Couldnt find window labelled 'main' // BIG PROBLEM");
            } 
            mainWindow = mainWindowRef;
            const code = $page.url.searchParams.get("code");
            console.log($page.params.service);
            if (!code) {
                throw new Error("Token wasnt in the returned params, try again.");
            }
            await mainWindow.emit("twitch-oauth-success", code);
        } catch(e) {
            console.log(e);
            if (mainWindow) {
                if (e instanceof Error) {
                    await mainWindow.emit("twitch-oauth-fail", e.message);
                } else if (typeof(e) === "string") {
                    await mainWindow.emit("twitch-oauth-fail", e);
                }
            }
        } finally {
            await appWindow.close();
        }
    });
    
    const focusWindows = async (e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; } ) => {
        await appWindow.setAlwaysOnTop(true);
        await mainWindow.setFocus();
        await appWindow.setAlwaysOnTop(false);
    }
</script>

<div role={"none"} onclick={focusWindows} class={"w-screen h-screen flex flex-col select-none"}>
    <div class={"m-auto h-20 w-56 bg-zinc-200 flex flex-col rounded-lg shadow-lg p-3 justify-center "}>
        <div class={"mt-auto mx-auto mb-2 font-bold"}>
            Waiting for OAuth
        </div>
        <Icon icon={"eos-icons:bubble-loading"} class={"mb-auto mx-auto text-5xl"} />
    </div>
</div>