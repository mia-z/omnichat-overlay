import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
	return [ { service: "twitch" } ];
};

export const prerender = true;