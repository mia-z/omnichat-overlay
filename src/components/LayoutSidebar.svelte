<script lang="ts">
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
</script>

<div class={"w-14 bg-zinc-700 h-full flex flex-col gap-y-3"}>
    <a href={"/"} class:selected={$page.url.pathname === "/"} class={"btn btn-base menu-btn flex"}>
        <Icon icon={"ci:main-component"} width={38} class={"m-auto text-magnum-700"} />
    </a>
    <a href={"/accounts"} class:selected={$page.url.pathname === "/accounts"} class={"btn btn-base menu-btn flex"}>
        <Icon icon={"ci:user-01"} width={38} class={"m-auto text-magnum-700"} />
    </a>
    <a href={"/settings"} class:selected={$page.url.pathname === "/settings"} class={"btn btn-base menu-btn mt-auto flex"}>
        <Icon icon={"ci:settings"} width={38} class={"m-auto w-full text-magnum-700"} />
    </a>
</div>

<style lang="scss">
    a.btn.menu-btn {
        &.selected {
            @apply bg-zinc-800 shadow-none text-zinc-200;
        }

        @apply p-0 border-none square-14 rounded-none;
    }
</style>