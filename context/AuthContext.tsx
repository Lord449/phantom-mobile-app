import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { STORAGE_KEYS, login as apiLogin } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  serverUrl: string;
  token: string | null;
  user: User | null;
  tier: "trial" | "basic" | "pro" | "enterprise";
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  setServerUrl: (url: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    serverUrl: "",
    token: null,
    user: null,
    tier: "trial",
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      const [serverUrl, token, userStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);
      const user = userStr ? (JSON.parse(userStr) as User) : null;
      setState({
        serverUrl: serverUrl ?? "",
        token,
        user,
        tier: "trial",
        isLoading: false,
      });
    })();
  }, []);

  const setServerUrl = useCallback(async (url: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, url);
    setState((s) => ({ ...s, serverUrl: url }));
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await apiLogin(username, password);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, result.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user)),
      ]);
      setState((s) => ({
        ...s,
        token: result.token,
        user: result.user,
        tier: (result.user.role as AuthState["tier"]) ?? "trial",
      }));
    },
    []
  );

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
    setState((s) => ({ ...s, token: null, user: null, tier: "trial" }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setServerUrl,
        login,
        logout,
        isAuthenticated: !!state.token && !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
