import { Store as TauriStore } from "tauri-plugin-store-api";

const tauriDataStore = new TauriStore(".auth");

export const SaveTwitchOAuthData = async (data: OAuthData) => {
    await tauriDataStore.set("twitch-oauth-data", data);
    await tauriDataStore.save();
}

export const LoadTwitchOAuthData = async (): Promise<OAuthData | null> => {
    return await tauriDataStore.get<OAuthData>("twitch-oauth-data");
}

export const DeleteTwitchOAuthData = async (): Promise<boolean> => {
    return await tauriDataStore.delete("twitch-oauth-data");
}

export const SaveYoutubeOAuthData = async (data: OAuthData) => {
    await tauriDataStore.set("youtube-oauth-data", data);
    await tauriDataStore.save();
}

export const LoadYoutubeOAuthData = async (): Promise<OAuthData | null> => {
    return await tauriDataStore.get<OAuthData>("youtube-oauth-data");
}