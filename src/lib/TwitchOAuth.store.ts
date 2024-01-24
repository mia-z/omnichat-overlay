import { writable, get } from "svelte/store";
import { DateTime } from "luxon";

type TwitchOAuthStore = {
    code: string,
    currentToken: {
        refreshToken: string,
        token: string,
        expiresAt: number,
        expiresIn: number
    }
}

const createOAuthStore = () => {
    const { subscribe, set, update } = writable<OAuthData | null>();
    set(null);

    const updateTwitchOAuthData = async (data: OAuthData) => {
        update((existing) => {
            return {
                ...existing,
                ...data
            }
        });
    }

    const setLoadedOAuthData = (data: OAuthData) => {
        update(() => {
            return {
                code: data.code,
                currentToken: {
                    token: data.currentToken.token,
                    expiresIn: data.currentToken.expiresIn,
                    refreshToken: data.currentToken.refreshToken,
                    expiresAt: data.currentToken.expiresAt
                }
            }
        });
    }

    const resetTwitchOAuthData = () => {
        set(null);
    }

    return {
        subscribe,
        updateTwitchOAuthData,
        setLoadedOAuthData,
        resetTwitchOAuthData
    }
}

export const twitchOAuthStore = createOAuthStore();
export const GetTwitchOAuthData = () => {
    return get(twitchOAuthStore);
}