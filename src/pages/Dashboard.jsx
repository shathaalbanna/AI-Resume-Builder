import { useNavigate } from "react-router-dom";
import { FiFileText, FiTrash2, FiPlus, FiShare2, FiExternalLink, FiBriefcase, FiClock } from "react-icons/fi";
import { fmtDate, initials, shareUrl } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import { btnPrimary, btnGhost } from "../styles";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, cvs, deleteCv, copy, notify } = useApp();
  const navigate = useNavigate();
  const mine = cvs.filter((c) => c.ownerId === user.id);

  const remove = (cv) => {
    if (window.confirm(`حذف «${cv.name}»؟`)) {
      deleteCv(cv.id);
      notify("تم حذف السيرة الذاتية");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              أهلاً {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-slate-500">
              لديك {mine.length} {mine.length === 1 ? "سيرة ذاتية" : "سير ذاتية"}
            </p>
          </div>
          <button onClick={() => navigate("/create-cv")} className={btnPrimary}>
            <FiPlus size={18} />
            إضافة CV جديد
          </button>
        </div>

        {mine.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
            <FiFileText className="mx-auto text-slate-300" size={44} />
            <p className="mt-3 font-semibold text-slate-800">لا توجد سير ذاتية بعد</p>
            <p className="mt-1 text-sm text-slate-500">ارفع سيرتك الحالية لتبدأ.</p>
            <button onClick={() => navigate("/create-cv")} className={`${btnPrimary} mt-5`}>
              <FiPlus size={18} />
              إضافة CV جديد
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((cv) => (
              <li
                key={cv.id}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-700/40 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">
                    {initials(cv.data.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-slate-900">{cv.name}</h2>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                      <FiBriefcase size={13} />
                      {cv.data.jobTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(cv)}
                    aria-label="حذف"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cv.data.skills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {s}
                    </span>
                  ))}
                  {cv.data.skills.length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                      +{cv.data.skills.length - 3}
                    </span>
                  )}
                </div>

                <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                  <FiClock size={13} />
                  آخر تعديل: {fmtDate(cv.updatedAt)}
                </p>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <button onClick={() => navigate(`/s/${cv.id}`)} className={`${btnGhost} flex-1`}>
                    <FiExternalLink size={15} />
                    عرض
                  </button>
                  <button
                    onClick={() => copy(shareUrl(cv.id))}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal-800 px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50"
                  >
                    <FiShare2 size={15} />
                    مشاركة
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
