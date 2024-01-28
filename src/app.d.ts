declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }

    type EntityRender = (context: CanvasRenderingContext2D, deltaTime: number) => void;
    type EntitySetup = (context: CanvasRenderingContext2D) => void;

    type RenderEntity = {
        render: EntityRender,
        setup?: EntitySetup
    }

    type RenderListProxy = {
        add(entity: RenderEntity): void,
        remove(entity: RenderEntity): void
    }

    type OAuthData = {
        enabled: boolean,
        code: OAuthCode,
        currentToken: OAuthTokenData
    }
    
    type OAuthCode = string;
    
    type OAuthTokenData = {
        token: string,
        refreshToken: string,
        expiresIn: number,
        expiresAt: number
    }

    interface OAuthResponse {
        access_token: string,
        expires_in: number,
        refresh_token: string,
        token_type: "bearer"
    }

    interface TwitchOAuthResponse extends OAuthResponse {
        scope: string[]
    }

    

    namespace Twitch {
        interface TwitchResponse<T> {
            data: T[]
        }

        interface User {
            id: string;
            login: string;
            display_name: string;
            type: "admin" | "global_mod" | "staff" | "";
            broadcaster_type: "affiliate" | "partner" | "";
            description: string;
            profile_image_url: string;
            offline_image_url: string;
            view_count: number;
            email: string;
            created_at: string;
        }
    }
}

export {};
