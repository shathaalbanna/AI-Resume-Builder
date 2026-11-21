import { useEffect } from "react";
import { FiCheck, FiCopy, FiExternalLink, FiLink } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { btnGhost } from "../styles";
import { fmtDate } from "../utils/helpers";

export default function ShareModal({ link, expiresAt, onClose }) {
  const { copy } = useApp();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <FiCheck size={28} />
        </div>
        <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
          رابط المشاركة جاهز
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          أي شخص لديه هذا الرابط يستطيع رؤية سيرتك الذاتية.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 p-2">
          <FiLink className="ms-1 shrink-0 text-slate-400" />
          <input
            readOnly
            dir="ltr"
            value={link}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"
          />
          <button
            onClick={() => copy(link)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-900"
          >
            <FiCopy size={14} />
            نسخ الرابط
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          {expiresAt ? `ينتهي الرابط في ${fmtDate(expiresAt)}` : "الرابط بدون تاريخ انتهاء"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a href={link} target="_blank" rel="noreferrer" className={btnGhost}>
            <FiExternalLink size={15} />
            فتح الرابط
          </a>
          <button onClick={onClose} className={btnGhost}>
            إلى سيري الذاتية
          </button>
        </div>
      </div>
    </div>
  );
}
