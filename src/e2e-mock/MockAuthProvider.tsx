/**
 * Drops in place of AuthContext when VITE_E2E_MOCK=true.
 * Always presents the mock user as signed in.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { MOCK_USER, reset } from "./store";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function E2eAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER as unknown as User);

  useEffect(() => {
    const w = window as Window & { __e2eReset?: () => void; __e2eMock?: boolean };
    w.__e2eReset = reset;
    w.__e2eMock = true;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setUser(MOCK_USER as unknown as User);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading: false, signInWithGoogle, logout }),
    [user, signInWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = E2eAuthProvider;
export { E2eAuthProvider as MockAuthProvider };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
