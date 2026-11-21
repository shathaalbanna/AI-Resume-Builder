 import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiBriefcase,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import ShareModal from "../components/ShareModal";
import StatusBadge from "../components/StatusBadge";
import { resumesApi } from "../services/api";
import { demoDrafts } from "../services/demo";
import { btnGhost, btnPrimary } from "../styles";
import { fmtDate, frontShareLink, initials, parseError } from "../utils/helpers";

export default function Dashboard() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: "", items: [], meta: null });
  const [shareInfo, setShareInfo] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (p) => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const r = await resumesApi.list(p, 9);
      setState({ loading: false, error: "", items: r.data ?? [], meta: r.meta ?? null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: parseError(e).message }));
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  // الملف محمي بالتوكن: نجلبه كـ blob ثم نعرضه/نحمّله
  const openFile = async (cv) => {
    const isPdf = cv.mime_type === "application/pdf";
    const win = isPdf ? window.open("", "_blank") : null;
    setBusyId(cv.id);
    try {
      const blob = await resumesApi.fileBlob(cv.id);
      const url = URL.createObjectURL(blob);
      if (win) {
        win.location.href = url;
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = cv.original_name;
        a.click();
      }
    } catch (e) {
      win?.close();
      notify(parseError(e).message);
    } finally {
      setBusyId(null);
    }
  };

  const share = async (cv) => {
    setBusyId(cv.id);
    try {
      const s = await resumesApi.share(cv.id);
      setShareInfo({ link: frontShareLink(s.share_url), expiresAt: s.expires_at });
    } catch (e) {
      notify(parseError(e).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (cv) => {
    if (!window.confirm(`حذف «${cv.title || cv.original_name}»؟ سيُحذف الملف وروابط المشاركة.`)) return;
    setBusyId(cv.id);
    try {
      await resumesApi.remove(cv.id);
      notify("تم حذف السيرة الذاتية");
      if (state.items.length === 1 && page > 1) setPage(page - 1);
      else load(page);
    } catch (e) {
      notify(parseError(e).message);
    } finally {
      setBusyId(null);
    }
  };

  const { loading, error, items, meta } = state;
  const total = meta?.total ?? items.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              أهلاً {user?.name?.split(" ")[0]}
            </h1>
            {!loading && !error && (
              <p className="mt-1 text-slate-500">
                لديك {total} {total === 1 ? "سيرة ذاتية" : "سير ذاتية"}
              </p>
            )}
          </div>
          <button onClick={() => navigate("/create-cv")} className={btnPrimary}>
            <FiPlus size={18} />
            إضافة CV جديد
          </button>
        </div>

        {loading && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </ul>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center">
            <FiAlertCircle className="mx-auto text-rose-500" size={36} />
            <p className="mt-3 font-semibold text-rose-800">{error}</p>
            <button onClick={() => load(page)} className={`${btnGhost} mt-4`}>
              <FiRefreshCw size={15} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
            <FiFileText className="mx-auto text-slate-300" size={44} />
            <p className="mt-3 font-semibold text-slate-800">لا توجد سير ذاتية بعد</p>
            <p className="mt-1 text-sm text-slate-500">ارفع سيرتك الحالية لتبدأ.</p>
            <button onClick={() => navigate("/create-cv")} className={`${btnPrimary} mt-5`}>
              <FiPlus size={18} />
              إضافة CV جديد
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((cv) => {
                const demo = !cv.profile_draft ? demoDrafts.get(cv.id) : null;
                const p = cv.profile_draft || demo;
                const busy = busyId === cv.id;
                return (
                  <li
                    key={cv.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-700/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">
                        {p?.full_name ? initials(p.full_name) : <FiFileText size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold text-slate-900">
                          {cv.title || cv.original_name}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                          {p?.job_title ? (
                            <>
                              <FiBriefcase size={13} />
                              {p.job_title}
                            </>
                          ) : (
                            <>
                              <FiFileText size={13} />
                              {cv.original_name} · {cv.file_size_human}
                            </>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(cv)}
                        disabled={busy}
                        aria-label="حذف"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <StatusBadge status={demo ? "demo" : cv.analysis_status} />
                    </div>

                    {(p?.skills ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.skills.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            {s}
                          </span>
                        ))}
                        {p.skills.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                            +{p.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                      <FiClock size={13} />
                      آخر تعديل: {fmtDate(cv.updated_at)}
                    </p>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button onClick={() => openFile(cv)} disabled={busy} className={`${btnGhost} flex-1`}>
                        {busy ? <FiLoader className="animate-spin" size={15} /> : <FiExternalLink size={15} />}
                        عرض الملف
                      </button>
                      <button
                        onClick={() => share(cv)}
                        disabled={busy}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal-800 px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50 disabled:opacity-50"
                      >
                        <FiShare2 size={15} />
                        مشاركة
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {meta && meta.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost}>
                  السابق
                </button>
                <span className="text-sm text-slate-500">
                  {meta.current_page} / {meta.last_page}
                </span>
                <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className={btnGhost}>
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {shareInfo && (
        <ShareModal link={shareInfo.link} expiresAt={shareInfo.expiresAt} onClose={() => setShareInfo(null)} />
      )}
    </div>
  );
}
