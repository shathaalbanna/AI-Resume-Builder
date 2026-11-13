import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { btnPrimary } from "../styles";
import Input from "../components/Input";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "أدخل اسمك الكامل";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "بريد إلكتروني غير صالح";
    if (f.password.length < 6) er.password = "6 أحرف على الأقل";
    if (f.confirm !== f.password) er.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(er);
    if (Object.keys(er).length) return;

    const r = register({ name: f.name.trim(), email: f.email.trim(), password: f.password });
    if (r.error) return setErrors({ email: r.error });
    navigate("/dashboard");
  };

  return (
    <AuthShell
      title="أنشئ حسابك"
      subtitle="ابدأ ببناء سيرتك الذاتية في دقائق."
      footer={
        <>
          لديك حساب؟{" "}
          <Link to="/login" className="font-semibold text-teal-800 hover:underline">
            سجّل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input icon={FiUser} label="الاسم الكامل" value={f.name} onChange={set("name")} error={errors.name} />
        <Input icon={FiMail} label="البريد الإلكتروني" type="email" value={f.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <Input icon={FiLock} label="كلمة المرور" type="password" value={f.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
        <Input icon={FiLock} label="تأكيد كلمة المرور" type="password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
        <button type="submit" className={`${btnPrimary} w-full`}>
          إنشاء الحساب
        </button>
      </form>
    </AuthShell>
  );
}
