<script lang="ts">
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
    import SidebarButton from "./SidebarButton.svelte";
</script>

<div class={"w-14 bg-zinc-700 h-full flex flex-col gap-y-3"}>
    <SidebarButton iconName={"ci:main-component"} pathToMatch={"/"} tooltipText={"Overlay Manager"} />
    <SidebarButton iconName={"ci:user-01"} pathToMatch={"/accounts"} tooltipText={"Accounts and Integrations"} />
    <SidebarButton iconName={"ci:settings"} pathToMatch={"/settings"} tooltipText={"Settings"} extraClass={"mt-auto"} />
</div>
