import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

const AUTH_TOKEN_KEY = "@4builder_token";
const ONBOARDED_KEY = "@4builder_onboarded";

interface AuthUser {
  id: string;
  phone: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  governorate?: string;
  neighborhood?: string;
  isVerified: boolean;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  hasOnboarded: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  markOnboarded: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  hasOnboarded: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
  markOnboarded: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    if (domain) {
      setBaseUrl(`https://${domain}`);
    }

    setAuthTokenGetter(async () => token);

    (async () => {
      try {
        const [storedToken, storedUser, onboarded] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem("@4builder_user"),
          AsyncStorage.getItem(ONBOARDED_KEY),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (onboarded) setHasOnboarded(true);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(async () => token);
  }, [token]);

  const login = async (newToken: string, newUser: AuthUser) => {
    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken),
      AsyncStorage.setItem("@4builder_user", JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem("@4builder_user"),
    ]);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    AsyncStorage.getItem("@4builder_user").then((raw) => {
      if (raw) {
        const parsed = JSON.parse(raw);
        AsyncStorage.setItem("@4builder_user", JSON.stringify({ ...parsed, ...updates }));
      }
    });
  };

  const markOnboarded = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setHasOnboarded(true);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, hasOnboarded, isLoading, login, logout, updateUser, markOnboarded }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
