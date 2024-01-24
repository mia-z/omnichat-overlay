<script lang="ts">
    import { onMount } from "svelte";
    import { appWindow } from "@tauri-apps/api/window";
    import { listen } from "@tauri-apps/api/event";
    
    let messages = $state<string[]>([]);
    let chatArea: HTMLDivElement;

    const scrollToBottom = () => {
        if (chatArea) {
            chatArea.scrollTo({ 
                behavior: "smooth",
                top: chatArea.scrollHeight
            });
        }
    }

    onMount(async () => {
        console.log(chatArea);
        listen<string>("twitch-message", ({ payload }) => {
            messages.push(payload);
            scrollToBottom();
        });
    });
</script>

<div class={"p-5 w-full h-full bg-red-500"}>
    <div bind:this={chatArea} class={"overflow-hidden h-full"}>
        {#each messages as message}
            {message}<br/>
        {/each}
    </div>
</div>