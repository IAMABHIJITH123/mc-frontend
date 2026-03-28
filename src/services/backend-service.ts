import { apiFetch } from "@/lib/api-client";

export interface ServerStats {
    _id: string;
    server: string;
    online: number;
    max: number;
    timestamp: string;
    __v?: number;
    // legacy fields from old data might exist
    players?: number;
    maxPlayers?: number;
    time?: string;
}

export const backendService = {
    /**
     * Get full server stats history from the backend
     */
    async getStats(): Promise<ServerStats[]> {
        return apiFetch<ServerStats[]>('/api/stats');
    },

    /**
     * Placeholder for future user backend endpoints
     */
    async getUsers() {
        return apiFetch('/users');
    },

    /**
     * Placeholder for future data endpoints
     */
    async getData() {
        return apiFetch('/data');
    }
};
