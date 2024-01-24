import axios from "axios";

const { VITE_TWITCH_CLIENT_ID, VITE_TWITCH_REDIRECT, VITE_TWITCH_SECRET } = import.meta.env;

export const GetTwitchToken = async (code: string) => {
    const tokenRes = await axios.post<TwitchOAuthResponse>(`https://id.twitch.tv/oauth2/token?client_id=${VITE_TWITCH_CLIENT_ID}&client_secret=${VITE_TWITCH_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${VITE_TWITCH_REDIRECT}`);
    return tokenRes.data;
}

export const RefreshTwitchToken = async (refreshToken: string) => {
    const refreshTokenRes = await axios.post<TwitchOAuthResponse>(`https://id.twitch.tv/oauth2/token?client_id=${VITE_TWITCH_CLIENT_ID}&client_secret=${VITE_TWITCH_SECRET}&refresh_token=${encodeURIComponent(refreshToken)}&grant_type=refresh_token`);
        return refreshTokenRes.data;
}

export const ValidateTwitchToken = async (token: string) => {
    const validateRes = await axios.get<TwitchOAuthResponse>(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            "Authorization": `OAuth ${token}`,
        }
    });
    return validateRes.data;
}

export const RevokeTwitchToken = async (token: string) => {
    const revokeRes = await axios.post(`https://id.twitch.tv/oauth2/revoke?client_id=${VITE_TWITCH_CLIENT_ID}&token=${token}`, null, { validateStatus: () => true });
    if (revokeRes.status !== 200) {
        console.log("Token revocation failed")
    }
}

export const GetTwitchUser = async (token: string) => {
    const userRes = await axios.get<Twitch.TwitchResponse<Twitch.User>>(`https://api.twitch.tv/helix/users`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Client-Id": VITE_TWITCH_CLIENT_ID
        }
    });
    return userRes.data.data[0];
}