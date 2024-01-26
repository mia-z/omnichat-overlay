import EventEmitter from "eventemitter3";

type TwitchCommand<T extends CommandCode> = {
    tags?: TwitchCommandTags<T>,
    source: TwitchCommandSource,
    code: T,
    parameters: CommandParameters<T>
}

type MessageTags = |
    "badge-info" | "badges" | "color" | "emotes" | "display-name" | "emotes" | "first-msg" | "flags" | "id" | "flags" |
    "mod" | "returning-chatter" | "room-id" | "subscriber" | "tmi-sent-ts" | "turbo" | "user-id" | "user-type" |
    "client-nonce" | "reply-parent-display-name" | "reply-parent-msg-body" | "reply-parent-msg-id" | "reply-parent-user-id" |
    "reply-parent-user-login" | "reply-thread-parent-display-name" | "reply-thread-parent-msg-id" | 
    "reply-thread-parent-user-id" | "reply-thread-parent-user-login" | "subscriber" | "user-type";

type GlobalUserStateTags = "badge-info" | "badges" | "color" | "display-name" | "emote-sets" | "user-id" | "user-type";

type UserStateTags = "subscriber" | "mod";

type RoomStateTags = "r9k" | "followers-only" | "slow" | "room-id" | "emote-only" | "subs-only";

type TwitchCommandTags<T> = Partial<Record<T extends "USERSTATE" ? UserStateTags : T extends "GLOBALUSERSTATE" ? GlobalUserStateTags : T extends "ROOMSTATE" ? RoomStateTags : T extends "PRIVMSG" ? MessageTags : never, string | number>>

type TwitchCommandSource = {
    host: string,
    nick?: string
}

const COMMANDS = ["CAP * ACK", "USERSTATE", "GLOBALUSERSTATE", "ROOMSTATE", "001", "002", "003", "004", "375", "372", "376", "353", "366", "JOIN", "PART", "PRIVMSG", "PING", "RECONNECT", "NOTICE", "HOSTTARGET", "CLEARCHAT", "UNKNOWN" ] as const;

type CommandCode = typeof COMMANDS[number];

type CommandParameters<T> = 
    T extends "CAP * ACK" ? {
        capabilities: string[]
    } : 
    T extends "USERSTATE" | "ROOMSTATE" ? {
        channel: string
    } : 
    T extends "GLOBALUSERSTATE" | "RECONNECT" | "PING" ? never :
    T extends "001" | "002" | "003" | "004" | "372" | "376" | "375" ? {
        user: string
        message: string
    } : 
    T extends "353" ? {
        channel: string,
        user: string,
        chatters: string[]
    } : 
    T extends "366" ? {
        channel: string,
        user: string,
        message: string
    } : 
    T extends "JOIN" | "PART" ? {
        channel: string
    } :
    T extends "PRIVMSG" | "NOTICE" | "CLEARCHAT" | "HOSTTARGET" ? {
        channel: string,
        message: string
    } :
    T extends "UNKNOWN" ? {
        raw: string
    } :
    never;

interface TwitchEvent {
    privmsg: (payload: TwitchCommand<"PRIVMSG">) => void;
    globaluserstate: (payload: TwitchCommand<"GLOBALUSERSTATE">) => void;
    roomstate: (payload: TwitchCommand<"ROOMSTATE">) => void;
    userstate: (payload: TwitchCommand<"USERSTATE">) => void;
    join: (payload: TwitchCommand<"JOIN">) => void;
    part: (payload: TwitchCommand<"PART">) => void;
}

export class TwitchChatSocket {
    private token: string;
    private channelToJoin: string
    private socket: WebSocket;

    connected: boolean = false;
    broadcaster: EventEmitter<TwitchEvent>;

    constructor(token: string, channelToJoin: string) {
        this.token = token;
        this.channelToJoin = channelToJoin;

        this.socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

        this.socket.addEventListener("open", () => {
            console.log("TWITCH SOCKET OPENED");
            this.socket.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
            this.socket.send(`PASS oauth:${this.token}`);
            this.socket.send(`NICK ${this.channelToJoin}`);
            this.socket.send(`JOIN #${this.channelToJoin},#chudlogic`);
            this.connected = true;
        });

        this.socket.addEventListener("close", (code) => {
            this.connected = false;
            console.log("TWITCH SOCKET CLOSED");
            console.log(code);
        });
        
        this.socket.addEventListener("error", (err) => {
            this.connected = false;
            console.log("TWITCH SOCKET ERROR");
            console.log(err);
        });

        this.socket.addEventListener("message", this.parseMessage);

        this.broadcaster = new EventEmitter();
    }

    private parseMessage = ({ data }: MessageEvent<string>) => { 
        const messages = data.split("\r\n").filter(x => x !== "");
        for (let message of messages) {
            let tags: TwitchCommandTags<CommandCode> = {},
                command: { code: CommandCode, parameters: CommandParameters<CommandCode> }, 
                source: TwitchCommandSource;
            switch (true) {
                case message.startsWith("@"): {
                    tags = this.parseTags(message);
                    message = this.removeTags(message);
                }
                case message.startsWith(":"): {
                    source = this.parseSource(message);
                    message = this.removeSource(message);
                    command = this.parseCommand(message);
                    this.handleMessage({tags, source, ...command});
                    break;
                }
                case message.startsWith("PING"): {
                    const [code, host] = message.split(" ");
                    if (code === "PING") {
                        this.handleMessage({
                            code: "PING",
                            source: {
                                host
                            }
                        } as TwitchCommand<"PING">); //Idk why typescript cant infer this ?
                    }
                    break;
                }
                default: console.log(`Unrecognized message: ${message}`); return;
            }
        }
    }

    close = () => {
        if (this.connected) {
            this.socket.close();
        }
    }

    private parseTags = (unparsedTags: string): TwitchCommandTags<CommandCode> => {
        let tagCollection = new Object();
        const indexOfFirstSpace = unparsedTags.indexOf(" ");
        const formatted = unparsedTags.slice(1, indexOfFirstSpace);
        const splitTags = formatted.split(";");
        for (const tagAndValue of splitTags) {
            const [ tag, value ] = tagAndValue.split("=");
            Object.assign(tagCollection, { [tag]: value });
        }

        return tagCollection;
    }

    private removeTags = (originalMessage: string) => {
        const indexOfFirstSpace = originalMessage.indexOf(" ");
        const formatted = originalMessage.slice(indexOfFirstSpace);

        return formatted.trim();
    }

    private parseSource = (unparsedSource: string): TwitchCommandSource => {
        const indexOfNextSpace = unparsedSource.indexOf(" ");
        const firstPart = unparsedSource.slice(0, indexOfNextSpace);

        if (firstPart.includes("!")) {
            const indexOfExcl = firstPart.indexOf("!");
            const nick = firstPart.slice(1, indexOfExcl);
            return {
                host: firstPart.replace(nick, ""),
                nick
            }
        } else {
            return {
                host: firstPart
            }
        }
    }

    private removeSource = (originalMessage: string) => {
        const indexOfNextSpace = originalMessage.indexOf(" ");
        const withoutSource = originalMessage.slice(indexOfNextSpace);

        return withoutSource.trim();
    }

    private parseCommand = (unparsedCommand: string): { code: CommandCode, parameters: CommandParameters<CommandCode> } => {
        const parts = unparsedCommand.split(" ");
        if (parts[0] === "CAP" && parts[1] === "*" && parts[2] === "ACK") {
            return {
                code: "CAP * ACK",
                parameters: {
                    capabilities: parts.slice(3)
                }
            }
        }

        const code: CommandCode = parts[0] as CommandCode;
        switch (code) {
            case "001": 
            case "002": 
            case "003": 
            case "004":
            case "372": 
            case "375": 
            case "376": return {
                code,
                parameters: {
                    user: parts[1],
                    message: parts.slice(2).join(" ").slice(1)
                }
            }
            case "353": 
                parts[4] = parts[4].replace(":", "");
                return {
                    code,
                    parameters: {
                        channel: parts[3],
                        user: parts[1],
                        chatters: parts.slice(4)
                    }
                }
            case "366": return {
                code,
                parameters: {
                    user: parts[1],
                    channel: parts[2],
                    message: parts.slice(3).join(" ").slice(1)
                }
            }
            case "USERSTATE":
            case "ROOMSTATE":
            case "JOIN":
            case "PART": return {
                code,
                parameters: {
                    channel: parts[1]
                }
            }
            case "RECONNECT":
            case "GLOBALUSERSTATE": return {
                code
            } as CommandParameters<"GLOBALUSERSTATE"> //Idk why typescript cant infer this ?
            case "NOTICE":
            case "CLEARCHAT":
            case "HOSTTARGET":
            case "PRIVMSG": return {
                code,
                parameters: {
                    channel: parts[1],
                    message: parts.slice(2).join(" ").slice(1)
                }
            }
            default: return {
                code: "UNKNOWN",
                parameters: {
                    raw: unparsedCommand
                }
            };
        }
    }

    private handleMessage = (command: TwitchCommand<CommandCode>) => {
        switch(command.code) {
            case "USERSTATE": this.broadcaster.emit("userstate", command as TwitchCommand<"USERSTATE">); break;
            case "GLOBALUSERSTATE": this.broadcaster.emit("globaluserstate", command as TwitchCommand<"GLOBALUSERSTATE">); break;
            case "ROOMSTATE": this.broadcaster.emit("roomstate", command as TwitchCommand<"ROOMSTATE">); break;
            case "JOIN": this.broadcaster.emit("join", command as TwitchCommand<"JOIN">); break;
            case "PART": this.broadcaster.emit("part", command as TwitchCommand<"PART">); break;
            case "PRIVMSG": this.broadcaster.emit("privmsg", command as TwitchCommand<"PRIVMSG">); break;
            case "PING": console.log("SENDING PONG"); this.socket.send(`PONG ${command.source.host}`); break;
            // case "RECONNECT":
            // case "NOTICE":
            // case "HOSTTARGET":
            // case "CLEARCHAT":
            default: return; //Do nothing
        }
    }
}