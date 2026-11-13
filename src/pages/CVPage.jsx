import { Link, useParams } from "react-router-dom";
import { FiMail, FiPhone, FiFileText, FiCopy, FiPrinter } from "react-icons/fi";
import { fmtDate, initials, shareUrl } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import { btnPrimary, btnGhost } from "../styles";
import Logo from "../components/Logo";

export default function CVPage() {
  const { id } = useParams();
  const { cvs, user, copy } = useApp();
  const cv = cvs.find((c) => c.id === id);

  if (!cv) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <FiFileText className="mx-auto text-slate-300" size={48} />
          <h1 className="mt-4 text-xl font-bold text-slate-900">لم نجد هذه السيرة الذاتية</h1>
          <p className="mt-1 text-slate-500">قد يكون الرابط غير صحيح أو تم حذف السيرة.</p>
          <Link to={user ? "/dashboard" : "/login"} className={`${btnPrimary} mt-6`}>
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  const d = cv.data;
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-2 print:hidden">
        <Link to={user ? "/dashboard" : "/login"} className="text-sm text-slate-500 hover:text-slate-900">
          <Logo />
        </Link>
        <div className="flex gap-2">
          <button onClick={() => copy(shareUrl(cv.id))} className={btnGhost}>
            <FiCopy size={15} />
            نسخ الرابط
          </button>
          <button onClick={() => window.print()} className={btnGhost}>
            <FiPrinter size={15} />
            طباعة
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-sm print:shadow-none">
        <header className="flex items-center gap-5 bg-teal-900 px-8 py-8 text-white">
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-white/15 text-2xl font-bold">
            {initials(d.fullName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{d.fullName}</h1>
            <p className="mt-1 text-teal-100">{d.jobTitle}</p>
          </div>
        </header>

        <div className="grid gap-8 p-8 md:grid-cols-3">
          <aside className="space-y-6">
            <div>
              <h2 className="mb-3 font-semibold text-slate-900">التواصل</h2>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <FiMail className="shrink-0 text-teal-700" />
                  <span className="break-all">{d.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiPhone className="shrink-0 text-teal-700" />
                  <span dir="ltr">{d.phone}</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-semibold text-slate-900">المهارات</h2>
              <div className="flex flex-wrap gap-1.5">
                {d.skills.map((s) => (
                  <span key={s} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="md:col-span-2">
            <h2 className="mb-3 font-semibold text-slate-900">نبذة</h2>
            <p className="leading-8 text-slate-700">{d.summary}</p>
          </section>
        </div>
      </article>

      <p className="mt-4 text-center text-xs text-slate-400 print:hidden">
        آخر تحديث: {fmtDate(cv.updatedAt)}
      </p>
    </main>
  );
}
