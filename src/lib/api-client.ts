const BASE_URL = 'https://api.allorigins.win/raw?url=http://se-mlm-01.velrix.net:4819';

export async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
        const response = await fetch(url); // ✅ NO headers

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error [${url}]:`, error);
        throw error;
    }
}
