<script lang="ts" context="module">
    export type ToastData = {
        title: string
        description: string
        color: string
    }
    
    const {
        elements: { content, title, description, close },
        helpers,
        states: { toasts },
        actions: { portal }
    } = createToaster<ToastData>()
    
    export const addToast = helpers.addToast;
    export const addErrorToast = (message: string) => {
        addToast({
            data: {
                title: "Error!",
                description: message,
                color: "bg-red-400"
            }
        });
    }
    export const addSuccessToast = (message: string = "") => {
        addToast({
            data: {
                title: "Success!",
                description: message,
                color: "bg-green-400"
            }
        });
    }
</script>
    
<script lang="ts">
    import { createToaster, melt } from "@melt-ui/svelte";
    import { fly } from "svelte/transition";
    import Icon from "@iconify/svelte";
</script>
    
<div class={"fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto"} use:portal>
    {#each $toasts as { id, data } (id)}
        <div use:melt={$content(id)}
            in:fly={{ duration: 150, x: "100%" }}
            out:fly={{ duration: 150, x: "100%" }}
            class={"rounded-lg bg-zinc-900 text-white shadow-md"}
        >
            <div class={"relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5 select-none"}>
                <div>
                    <h3 use:melt={$title(id)} class={"flex items-center gap-2 font-bold"}>
                        {data.title}
                        <span class={`rounded-full square-1.5 ${data.color}`} />
                    </h3>
                    <div class={"text-sm font-wix-madefor-text"} use:melt={$description(id)}>
                        {data.description}
                    </div>
                </div>
                <button use:melt={$close(id)} class={"absolute p-0 right-4 top-4 grid place-items-center rounded-full text-magnum-500 square-6 hover:bg-magnum-900/50"}>
                    <Icon icon={"mdi:close"} class={"square-4"} />
                </button>
            </div>
        </div>
    {/each}
</div>