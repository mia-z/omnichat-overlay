<script lang="ts">
    import { onMount } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { fade } from "svelte/transition";
    import Icon from "@iconify/svelte";
    import { appWindow } from "@tauri-apps/api/window";

    let messages = $state<string[]>([]);
    let chatArea = $state<HTMLDivElement>();

    let locked = $state(false);

    const scrollToBottom = () => {
        if (chatArea) {
            chatArea.scrollTo({ 
                behavior: "smooth",
                top: chatArea.scrollHeight
            });
        }
    }

    const toggleOverlay = () => {
        if (locked) {
            locked = false;
            appWindow.setResizable(true);
            appWindow.setCursorGrab(true);
        } else {
            locked = true;
            appWindow.setResizable(false);
            appWindow.setCursorGrab(false);
        }
    }

    onMount(async () => {
        await appWindow.setResizable(true);
        locked = false;
        listen<string>("twitch-message", ({ payload }) => {
            messages.push(payload);
            scrollToBottom();
        });
        listen("toggle-overlay-lock", () => {
            toggleOverlay();
        });
    });
</script>

<div class={"absolute top-0 left-0 w-screen h-screen flex flex-col bg-transparent"}>
    {#if !locked}
        <div transition:fade={{ duration: 100 }} class={"absolute top-0 left-0 h-full w-full bg-zinc-900/90 backdrop-blur-sm border-2 border-zinc-200/90 rounded-md flex flex-col justify-evenly select-none"}>
            <Icon class={"absolute top-0 left-0 text-white"} width={30} icon={"ci:arrow-up-left-md"} />
            <Icon class={"absolute top-0 right-0 text-white"} width={30} icon={"ci:arrow-up-right-md"} />
            <Icon class={"absolute bottom-0 left-0 text-white"} width={30} icon={"ci:arrow-down-left-md"} />
            <Icon class={"absolute bottom-0 right-0 text-white"} width={30} icon={"ci:arrow-down-right-md"} />
            <div data-tauri-drag-region class={"absolute top-1/2 left-1/2 -translate-x-[80px] -translate-y-[80px] h-40 w-40 rounded-full bg-zinc-900 flex cursor-move"}>
                <Icon class={"m-auto text-white pointer-events-none"} width={30} icon={"ci:move"} />
            </div>
            <Icon class={"absolute top-0 left-1/2 -translate-1/2 text-white"} width={30} icon={"ci:move-vertical"} />
            <Icon class={"absolute top-1/2 right-0 -translate-1/2 text-white"} width={30} icon={"ci:move-horizontal"} />
            <div class={"flex flex-col"}>
                <div class={"text-center font-bold text-3xl text-zinc-200"}>
                    Overlay Window Unlocked
                </div>
            </div>
            <div class={"flex flex-col"}>
                <div class={"text-center text-xl text-zinc-200"}>
                    You can move and resize the overlay while it is unlocked.
                </div>
                <div class={"text-center italic text-zinc-200"}>
                    Lock the overlay to hide this.
                </div>
                <button onclick={toggleOverlay} class={"btn btn-base w-2/3 mx-auto mt-5"}>
                    Lock overlay
                </button>
            </div>
        </div>
    {/if}
    <div class={"p-5 w-full h-full bg-zinc-900/40"}>
        <div bind:this={chatArea} class={"overflow-hidden text-lg text-shadow h-full text-zinc-100/90"}>
        {#each messages as message}
                {message}<br/>
            {/each}
        </div>
    </div>
</div>
