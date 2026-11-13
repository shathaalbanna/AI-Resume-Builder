import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FiCheck } from "react-icons/fi";
import { read, write, uid, today } from "../utils/helpers";
import { seedCvs } from "../data/mock";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => read("arb_users", []));
  const [sessionId, setSessionId] = useState(() => read("arb_session", null));
  const [cvs, setCvs] = useState(() => read("arb_cvs", []));
  const [toast, setToast] = useState(null);

  useEffect(() => write("arb_users", users), [users]);
  useEffect(() => write("arb_session", sessionId), [sessionId]);
  useEffect(() => write("arb_cvs", cvs), [cvs]);

  const user = users.find((u) => u.id === sessionId) || null;

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const register = ({ name, email, password }) => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "هذا البريد الإلكتروني مسجّل مسبقاً" };
    }
    const u = { id: uid(), name, email, password };
    setUsers((p) => [...p, u]);
    setCvs((p) => [...seedCvs(u.id, name, email), ...p]);
    setSessionId(u.id);
    return { ok: true };
  };

  const login = ({ identifier, password }) => {
    const id = identifier.trim().toLowerCase();
    const u = users.find(
      (x) =>
        (x.email.toLowerCase() === id || x.name.toLowerCase() === id) &&
        x.password === password
    );
    if (!u) return { error: "بيانات الدخول غير صحيحة" };
    setSessionId(u.id);
    return { ok: true };
  };

  const logout = () => setSessionId(null);

  const addCv = (data) => {
    const cv = {
      id: uid(),
      ownerId: user.id,
      name: `CV - ${data.jobTitle || data.fullName}`,
      updatedAt: today(),
      data,
    };
    setCvs((p) => [cv, ...p]);
    return cv;
  };

  const deleteCv = (id) => setCvs((p) => p.filter((c) => c.id !== id));

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
      value={{ user, cvs, register, login, logout, addCv, deleteCv, copy, notify }}
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
