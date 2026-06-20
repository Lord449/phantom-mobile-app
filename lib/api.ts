import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  SERVER_URL: "phantom_server_url",
  TOKEN: "phantom_token",
  USER: "phantom_user",
  LICENSE: "phantom_license",
};

async function getBase(): Promise<string> {
  const url = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL);
  return (url ?? "").replace(/\/$/, "");
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const base = await getBase();
  const headers = await getHeaders();
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export interface LoginResult {
  token: string;
  user: { id: number; username: string; email: string; role: string };
}

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  const base = await getBase();
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(err?.message ?? "Login failed");
  }
  return res.json();
}

export async function checkHealth(serverUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${serverUrl.replace(/\/$/, "")}/api/v1/health`, {
      method: "GET",
    });
    return res.ok;
  } catch {
    return false;
  }
}
