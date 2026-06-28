import { createContext, useContext, useState, type ReactNode } from "react";

import { api } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
  accept_terms: boolean;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  }

  async function register(payload: RegisterPayload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
