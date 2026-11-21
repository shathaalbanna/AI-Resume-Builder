import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import AuthShell from "../components/AuthShell";
import Input from "../components/Input";
import { btnPrimary } from "../styles";
import { parseError } from "../utils/helpers";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email: f.email.trim(), password: f.password });
      navigate("/dashboard");
    } catch (err) {
      const { fields, message } = parseError(err);
      setError(fields.email || fields.password || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="مرحباً بعودتك"
      subtitle="سجّل دخولك لإدارة سيرك الذاتية."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-semibold text-teal-800 hover:underline">
            أنشئ حساباً
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          icon={FiMail}
          label="البريد الإلكتروني"
          type="email"
          required
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          autoComplete="username"
        />
        <Input
          icon={FiLock}
          label="كلمة المرور"
          type="password"
          required
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          autoComplete="current-password"
        />
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <FiAlertCircle className="shrink-0" /> {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
          {loading && <FiLoader className="animate-spin" />}
          تسجيل الدخول
        </button>
      </form>
    </AuthShell>
  );
}
