import { writable, get, derived } from "svelte/store";

type OAuthStore = {
    twitch: OAuthData | null
}

const createOAuthStore = () => {
    const { subscribe, set, update } = writable<OAuthStore>();
    set({
        twitch: null
    });

    const updateTwitchOAuthData = async (data: OAuthData) => {
        update((store) => {
            return {
                ...store,
                twitch: {
                    ...store.twitch,
                    ...data,
                }
            }
        });
    }

    const setLoadedOAuthData = (data: OAuthData) => {
        update((store) => {
            return {
                ...store,
                twitch: {
                    ...data
                }
            }
        });
    }

    const resetTwitchOAuthData = () => {
        update((store) => {
            return {
                ...store,
                twitch: null
            }
        });
    }

    return {
        subscribe,
        twitch: {
            updateTwitchOAuthData,
            setLoadedOAuthData,
            resetTwitchOAuthData
        }
    }
}

export const oauthStore = createOAuthStore();

export const twitchOAuthStore = derived(oauthStore, ($store) => {
    return  $store.twitch;
});

export const twitchOAuth = () => {
    return get(twitchOAuthStore);
}

export const hasOAuth = derived(oauthStore, ($store) => {
    return (!!$store.twitch);
});