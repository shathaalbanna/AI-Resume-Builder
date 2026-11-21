import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { authApi, tokenStore, setUnauthorizedHandler } from "../services/api";

const USER_KEY = "arb_user";
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return tokenStore.get() ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
    } catch {
      return null;
    }
  });
  const [hfToken, setHfToken] = useState(import.meta.env.VITE_HF_TOKEN ?? "");
  const [toast, setToast] = useState(null);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setHfToken(import.meta.env.VITE_HF_TOKEN ?? "");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const startSession = ({ student, access_token }) => {
    tokenStore.set(access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(student));
    setUser(student);
  };

  const register = async (body) => startSession(await authApi.register(body));
  const login = async (body) => startSession(await authApi.login(body));
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    }
    clearSession();
  };

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("تم نسخ الرابط");
    } catch {
      window.prompt("انسخ الرابط:", text);
    }
  };

  return (
    <Ctx.Provider
      value={{ user, hfToken, setHfToken, register, login, logout, notify, copy }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 start-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg rtl:translate-x-1/2">
          <FiCheck className="text-emerald-400" />
          {toast}
        </div>
      )}
    </Ctx.Provider>
  );
}
