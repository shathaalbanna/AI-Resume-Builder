import { useState } from "react";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { inputCls } from "../styles";

export default function Input({ icon: Icon, label, error, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          type={isPass && show ? "text" : type}
          className={`${inputCls} ${Icon ? "ps-10" : ""} ${isPass ? "pe-10" : ""} ${
            error ? "border-rose-400" : ""
          }`}
          {...props}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
          <FiAlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
