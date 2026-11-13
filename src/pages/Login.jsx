import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { btnPrimary } from "../styles";
import Input from "../components/Input";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const r = login(f);
    if (r.error) return setError(r.error);
    navigate("/dashboard");
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
          label="البريد الإلكتروني أو اسم المستخدم"
          required
          value={f.identifier}
          onChange={(e) => setF({ ...f, identifier: e.target.value })}
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
            <FiAlertCircle /> {error}
          </p>
        )}
        <button type="submit" className={`${btnPrimary} w-full`}>
          تسجيل الدخول
        </button>
      </form>
    </AuthShell>
  );
}
