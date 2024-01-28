<script lang="ts">
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
    import { createTooltip, melt } from "@melt-ui/svelte";
    import { fade } from "svelte/transition";

    type SidebarButtonProps = {
        pathToMatch: string,
        iconName: string,
        tooltipText: string,
        extraClass?: string
    }

    let {
        pathToMatch,
        iconName,
        tooltipText,
        extraClass = ""
    } = $props<SidebarButtonProps>();

        const {
    elements: { trigger, content, arrow },
    states: { open },
    } = createTooltip({
        positioning: {
        placement: "left",
        },
        openDelay: 0,
        closeDelay: 0,
        closeOnPointerDown: false,
        forceVisible: true,
    });
</script>

<a use:melt={$trigger} href={pathToMatch} class:selected={$page.url.pathname === pathToMatch} class={"btn btn-base menu-btn flex " + extraClass}>
    <Icon icon={iconName} width={38} class={"m-auto text-magnum-700"} />
</a>

{#if $open}
    <div use:melt={$content} transition:fade={{ duration: 100 }} class={"z-10 rounded-lg bg-white shadow"} >
        <p class={"px-4 bg-zinc-800/90 py-1 text-zinc-200/90"}>{tooltipText}</p>
    </div>
{/if}

<style lang="scss">
    a.btn.menu-btn {
        &.selected {
            @apply bg-zinc-800 shadow-none text-zinc-200;
        }

        @apply p-0 border-none square-14 rounded-none;
    }
</style>