<script lang="ts">
    import TwitchOAuthComponent from "$components/TwitchOAuthComponent.svelte";
</script>

<div class={"flex flex-col w-full"}>
    <div class={"prose select-none w-full mx-auto p-3"}>
        <h3 class={"underline text-magnum-700 font-bold text-center"}>
            Accounts and Integration
        </h3>
        <p class={"text-zinc-200/80 text-center"}>
            Use the below links to connect accounts.
        </p>
    </div>
    <div class={"grid grid-cols-2 grid-flow-row w-full overflow-auto overflow-x-none gap-2 p-2"}>
        <div class={"h-64 col-span-1 w-full rounded-lg  bg-zinc-900/60 relative"}>
            <div class={"absolute top-0 left-0 w-full h-2 bg-[--twitch-purple] rounded-t-lg"} />
            <TwitchOAuthComponent />
        </div>
        <div class={"h-64 col-span-1 w-full rounded-lg bg-zinc-900/60 relative flex flex-col"}>
            <div class={"absolute top-0 left-0 w-full h-2 bg-magnum-700 rounded-t-lg"} />
            <div class={"prose m-auto select-none"}>
                <h3 class={"text-zinc-200 font-bold text-center"}>
                    More integrations coming soon
                </h3>
                <p class={"text-center text-zinc-200/80"}>
                    Looking for a specific or custom integration? Email miaz at #PUT EMAIL ADDRESS HERE SILLY#
                </p>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    ::-webkit-scrollbar {
        width: 14px;
    }

    ::-webkit-scrollbar-thumb {
        @apply border-[4px] border-solid border-transparent bg-clip-padding rounded-full bg-slate-200;
    }
</style>