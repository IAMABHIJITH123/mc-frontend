const BASE_TARGET = "http://se-mlm-01.velrix.net:4819";

const PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/"
];

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  let lastError: any;

  for (const proxy of PROXIES) {
    const url = proxy + BASE_TARGET + path;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      console.warn(`Proxy failed: ${proxy}`, error);
      lastError = error;
    }
  }

  console.error("All proxies failed");
  throw lastError || new Error("All proxies failed");
}
