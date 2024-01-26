import { get } from "svelte/store";
import { twitchOAuthStore } from "$lib/TwitchOAuth.store";

export type EnabledIntegrationsMap = {
    twitch: boolean,
    youtube: boolean,
    kick: boolean
}

export const hasIntegrations = () => {
    const twitch = get(twitchOAuthStore);

    return (!!twitch);
}

export const availableIntegrations = (): EnabledIntegrationsMap => {
    return {
        twitch: !!get(twitchOAuthStore),
        youtube: false,
        kick: false
    }
}