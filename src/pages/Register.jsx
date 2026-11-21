import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import AuthShell from "../components/AuthShell";
import Input from "../components/Input";
import { btnPrimary } from "../styles";
import { parseError } from "../utils/helpers";

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = "أدخل اسمك الكامل";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = "بريد إلكتروني غير صالح";
    if (f.password.length < 8) er.password = "8 أحرف على الأقل";
    if (f.confirm !== f.password) er.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(er);
    setFormError("");
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        password_confirmation: f.confirm,
      });
      navigate("/dashboard");
    } catch (err) {
      const { fields, message } = parseError(err);
      setErrors({
        name: fields.name,
        email: fields.email,
        password: fields.password,
        confirm: fields.password_confirmation,
      });
      if (!Object.keys(fields).length) setFormError(message);
    } finally {
      setLoading(false);
    }
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
        {formError && (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <FiAlertCircle className="shrink-0" /> {formError}
          </p>
        )}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
          {loading && <FiLoader className="animate-spin" />}
          إنشاء الحساب
        </button>
      </form>
    </AuthShell>
  );
}
