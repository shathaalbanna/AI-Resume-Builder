import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPrinter,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import Logo from "../components/Logo";
import { sharedApi } from "../services/api";
import { demoDrafts } from "../services/demo";
import { btnGhost, btnPrimary } from "../styles";
import { fmtDate, initials, parseError } from "../utils/helpers";

const range = (x) => [x.start_date, x.end_date].filter(Boolean).join(" - ");

export default function CVPage() {
  const { token } = useParams();
  const { user, copy } = useApp();
  const [state, setState] = useState({ loading: true, cv: null, error: "", notFound: false });

  useEffect(() => {
    let alive = true;
    sharedApi
      .get(token)
      .then((cv) => alive && setState({ loading: false, cv, error: "", notFound: false }))
      .catch((e) => {
        if (!alive) return;
        const { status, message } = parseError(e);
        setState({ loading: false, cv: null, error: message, notFound: status === 404 });
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const home = user ? "/dashboard" : "/login";
  const { loading, cv, error, notFound } = state;

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <FiLoader className="animate-spin text-teal-700" size={32} />
      </main>
    );
  }

  if (!cv) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <FiFileText className="mx-auto text-slate-300" size={48} />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {notFound ? "هذا الرابط غير متاح" : "تعذّر تحميل السيرة الذاتية"}
          </h1>
          <p className="mt-1 text-slate-500">
            {notFound ? "قد يكون الرابط منتهياً أو تم إلغاؤه." : error}
          </p>
          <Link to={home} className={`${btnPrimary} mt-6`}>
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  const d = cv.profile_draft || demoDrafts.get(cv.resume_id);
  const skills = d?.skills ?? [];
  const experience = d?.experience ?? [];
  const education = d?.education ?? [];
  const name = d?.full_name || cv.title || cv.original_name;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-2 print:hidden">
        <Link to={home}>
          <Logo />
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href={sharedApi.fileUrl(token)} target="_blank" rel="noreferrer" className={btnGhost}>
            <FiExternalLink size={15} />
            الملف الأصلي
          </a>
          <a href={sharedApi.fileUrl(token, true)} className={btnGhost}>
            <FiDownload size={15} />
            تحميل
          </a>
          <button onClick={() => copy(window.location.href)} className={btnGhost}>
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
            {d?.full_name ? initials(d.full_name) : <FiFileText size={30} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            {d?.job_title && <p className="mt-1 text-teal-100">{d.job_title}</p>}
          </div>
        </header>

        {!d ? (
          <div className="p-8 text-center text-slate-500">
            <FiFileText className="mx-auto text-slate-300" size={40} />
            <p className="mt-3">لم يتم تحليل هذه السيرة الذاتية بعد. يمكنك عرض الملف الأصلي أو تحميله من الأعلى.</p>
            <p className="mt-1 text-xs text-slate-400">{cv.original_name} · {cv.file_size_human}</p>
          </div>
        ) : (
          <div className="grid gap-8 p-8 md:grid-cols-3">
            <aside className="space-y-6">
              <div>
                <h2 className="mb-3 font-semibold text-slate-900">التواصل</h2>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  {d.email && (
                    <li className="flex items-center gap-2">
                      <FiMail className="shrink-0 text-teal-700" />
                      <span className="break-all">{d.email}</span>
                    </li>
                  )}
                  {d.phone && (
                    <li className="flex items-center gap-2">
                      <FiPhone className="shrink-0 text-teal-700" />
                      <span dir="ltr">{d.phone}</span>
                    </li>
                  )}
                  {d.location && (
                    <li className="flex items-center gap-2">
                      <FiMapPin className="shrink-0 text-teal-700" />
                      {d.location}
                    </li>
                  )}
                  {d.linkedin_url && (
                    <li className="flex items-center gap-2">
                      <FiLinkedin className="shrink-0 text-teal-700" />
                      <a href={d.linkedin_url} target="_blank" rel="noreferrer" className="break-all hover:underline">
                        LinkedIn
                      </a>
                    </li>
                  )}
                  {d.github_url && (
                    <li className="flex items-center gap-2">
                      <FiGithub className="shrink-0 text-teal-700" />
                      <a href={d.github_url} target="_blank" rel="noreferrer" className="break-all hover:underline">
                        GitHub
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              {skills.length > 0 && (
                <div>
                  <h2 className="mb-3 font-semibold text-slate-900">المهارات</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <section className="space-y-7 md:col-span-2">
              {d.professional_summary && (
                <div>
                  <h2 className="mb-2 font-semibold text-slate-900">نبذة</h2>
                  <p className="leading-8 text-slate-700">{d.professional_summary}</p>
                </div>
              )}
              {experience.length > 0 && (
                <div>
                  <h2 className="mb-3 font-semibold text-slate-900">الخبرات</h2>
                  <ul className="space-y-4">
                    {experience.map((x, i) => (
                      <li key={i} className="border-s-2 border-teal-700/30 ps-4">
                        <p className="font-semibold text-slate-900">{x.job_title}</p>
                        <p className="text-sm text-slate-500">
                          {[x.company, x.location, range(x)].filter(Boolean).join(" · ")}
                        </p>
                        {x.description && <p className="mt-1 text-sm leading-7 text-slate-700">{x.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {education.length > 0 && (
                <div>
                  <h2 className="mb-3 font-semibold text-slate-900">التعليم</h2>
                  <ul className="space-y-4">
                    {education.map((x, i) => (
                      <li key={i} className="border-s-2 border-teal-700/30 ps-4">
                        <p className="font-semibold text-slate-900">{x.degree}</p>
                        <p className="text-sm text-slate-500">
                          {[x.institution, x.location, range(x)].filter(Boolean).join(" · ")}
                        </p>
                        {x.description && <p className="mt-1 text-sm leading-7 text-slate-700">{x.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        )}
      </article>

      <p className="mt-4 text-center text-xs text-slate-400 print:hidden">
        تمت المشاركة: {fmtDate(cv.shared_at)}
        {cv.expires_at ? ` · ينتهي الرابط: ${fmtDate(cv.expires_at)}` : ""}
      </p>
    </main>
  );
}
