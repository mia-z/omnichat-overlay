import { derived, writable, get } from "svelte/store";

const createTwitchUserStore = () => {
    const { subscribe, set, update} = writable<Twitch.User | null>(null);

    const setInitialTwitchUser = (user: Twitch.User) => set(user);

    const resetTwitchUser = () => {
        set(null);
    }

    return {
        subscribe,
        setInitialTwitchUser,
        resetTwitchUser
    }
}

export const twitchUserStore = createTwitchUserStore(); 