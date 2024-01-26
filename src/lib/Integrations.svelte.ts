import { writable } from "svelte/store";
import { twitchOAuthStore } from "./TwitchOAuth.store";

class Integrations {
    twitch = $state(twitchOAuthStore)
}

export const integrations = new Integrations();