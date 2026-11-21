import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiGithub,
  FiInfo,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useApp } from "../context/AppContext";
import Input from "../components/Input";
import Navbar from "../components/Navbar";
import Recommendations from "../components/Recommendations";
import ShareModal from "../components/ShareModal";
import Stepper from "../components/Stepper";
import { resumesApi } from "../services/api";
import { AI_MODE, analyzeCv, isLocalAI, recommendCv } from "../services/ai";
import { demoDrafts } from "../services/demo";
import { btnGhost, btnPrimary, inputCls } from "../styles";
import { formToDraft, frontShareLink, mapDraft, parseError, validateFile } from "../utils/helpers";

export default function CreateCV() {
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resume, setResume] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  // idle | uploading | pending | processing | completed | failed
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState(mapDraft(null));
  const [skillInput, setSkillInput] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [recs, setRecs] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState("");

  const [expires, setExpires] = useState("");
  const [approving, setApproving] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);

  const busy = status === "uploading" || status === "processing";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const analyze = async (id, f = cvFile) => {
    setError("");
    setStatus("processing");
    try {
      const draft = await analyzeCv({ resumeId: id, file: f, user });
      setForm(mapDraft(draft));
      setRecs(null);
      setStatus("completed");
    } catch (e) {
      setStatus("failed");
      setError(parseError(e).message);
    }
  };

  const handleFile = async (file) => {
    if (!file || busy) return;
    const invalid = validateFile(file);
    if (invalid) return notify(invalid, "error");

    setError("");
    setFileName(file.name);
    setCvFile(file);
    setResume(null);
    setRecs(null);
    setStatus("uploading");
    try {
      const r = await resumesApi.upload(file, file.name.replace(/\.[^.]+$/, ""));
      setResume(r);
      await analyze(r.id, file);
    } catch (e) {
      setStatus("idle");
      notify(parseError(e).message, "error");
    }
  };

  const fetchRecs = async () => {
    setRecsError("");
    setRecsLoading(true);
    try {
      setRecs(
        await recommendCv({
          resumeId: resume.id,
          draft: formToDraft(form),
          targetRole: targetRole.trim(),
        })
      );
    } catch (e) {
      setRecsError(parseError(e).message);
    } finally {
      setRecsLoading(false);
    }
  };

  const addSkill = (value) => {
    const v = value.trim();
    if (!v) return;
    setForm((f) =>
      f.skills.some((s) => s.toLowerCase() === v.toLowerCase())
        ? f
        : { ...f, skills: [...f.skills, v] }
    );
  };

  const approve = async () => {
    setApproving(true);
    try {
      // في الوضع التجريبي نحفظ تعديلاتك في هذا المتصفح ليعرضها رابط المشاركة
      if (isLocalAI) demoDrafts.set(resume.id, formToDraft(form));
      const s = await resumesApi.share(resume.id, expires ? Number(expires) : null);
      setShareInfo({ link: frontShareLink(s.share_url), expiresAt: s.expires_at });
    } catch (e) {
      notify(parseError(e).message, "error");
    } finally {
      setApproving(false);
    }
  };

  const step = shareInfo ? 3 : status === "completed" ? 2 : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            aria-label="رجوع"
            className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          >
            <FiArrowRight size={18} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">إنشاء وتحليل السيرة الذاتية</h1>
        </div>

        <Stepper step={step} />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* القسم الأول: الرفع والبيانات */}
          <section className="space-y-5 lg:col-span-3">
            {AI_MODE === "demo" && (
              <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <FiInfo className="mt-0.5 shrink-0" />
                الوضع التجريبي: التحليل والاقتراحات بيانات مثال بدون ذكاء اصطناعي. الرفع والمشاركة حقيقيان.
              </p>
            )}
            {AI_MODE === "groq" && (
              <p className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                <FiInfo className="mt-0.5 shrink-0" />
                التحليل والاقتراحات بواسطة Groq من المتصفح. تُحفظ النتيجة في هذا المتصفح فقط.
              </p>
            )}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => !busy && fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && !busy && fileRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                busy ? "cursor-wait opacity-70" : "cursor-pointer"
              } ${
                dragOver
                  ? "border-teal-700 bg-teal-50"
                  : "border-slate-300 bg-white hover:border-teal-700/50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <FiUploadCloud className="mx-auto text-teal-700" size={38} />
              <p className="mt-3 font-semibold text-slate-800">
                اسحب ملف السيرة الذاتية هنا أو اضغط للاختيار
              </p>
              <p className="mt-1 text-sm text-slate-500">PDF أو DOC أو DOCX — حتى 10MB</p>

              {status === "uploading" && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
                  <FiLoader className="animate-spin" /> جارٍ رفع «{fileName}»…
                </p>
              )}
              {status === "processing" && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
                  <FiLoader className="animate-spin" /> جارٍ تحليل الـ CV بالذكاء الاصطناعي… قد يستغرق دقيقة
                </p>
              )}
              {status === "completed" && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                  <FiCheck size={15} />
                  تم تحليل «{fileName}» وتعبئة الحقول
                </p>
              )}
            </div>

            {error && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <span className="flex items-start gap-2">
                  <FiAlertCircle className="mt-0.5 shrink-0" />
                  {error}
                </span>
                {resume && (status === "pending" || status === "failed") && (
                  <button onClick={() => analyze(resume.id)} className={btnGhost}>
                    <FiRefreshCw size={14} />
                    {status === "failed" ? "إعادة المحاولة" : "تحليل الـ CV"}
                  </button>
                )}
              </div>
            )}

            {resume && !error && status === "pending" && (
              <button onClick={() => analyze(resume.id)} className={btnPrimary}>
                <HiSparkles size={17} />
                تحليل الـ CV
              </button>
            )}

            {status === "completed" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-4 font-semibold text-slate-900">بيانات السيرة الذاتية</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input icon={FiUser} label="الاسم الكامل" value={form.fullName} onChange={set("fullName")} />
                  <Input icon={FiBriefcase} label="المسمى الوظيفي" value={form.jobTitle} onChange={set("jobTitle")} />
                  <Input icon={FiMail} label="البريد الإلكتروني" type="email" value={form.email} onChange={set("email")} />
                  <Input icon={FiPhone} label="رقم الهاتف" value={form.phone} onChange={set("phone")} />
                  <Input icon={FiMapPin} label="الموقع" value={form.location} onChange={set("location")} />
                  <Input icon={FiLinkedin} label="LinkedIn" value={form.linkedin} onChange={set("linkedin")} />
                  <Input icon={FiGithub} label="GitHub" value={form.github} onChange={set("github")} />
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">المهارات الأساسية</label>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 py-1 ps-3 pe-1.5 text-sm text-teal-900">
                        {s}
                        <button
                          onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))}
                          aria-label={`حذف ${s}`}
                          className="grid size-5 place-items-center rounded-full text-teal-700 hover:bg-teal-100"
                        >
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="أضف مهارة ثم Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(skillInput);
                          setSkillInput("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        addSkill(skillInput);
                        setSkillInput("");
                      }}
                      className={`${btnGhost} shrink-0`}
                    >
                      <FiPlus size={16} />
                      إضافة
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">نبذة عني</label>
                  <textarea rows={4} className={inputCls} value={form.summary} onChange={set("summary")} />
                </div>

                {form.experience.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">الخبرات</h3>
                    <ul className="space-y-2">
                      {form.experience.map((x, i) => (
                        <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                          <p className="font-semibold text-slate-900">
                            {x.job_title}
                            {x.company ? ` — ${x.company}` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {[x.location, [x.start_date, x.end_date].filter(Boolean).join(" - ")].filter(Boolean).join(" · ")}
                          </p>
                          {x.description && <p className="mt-1 text-slate-600">{x.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.education.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2 text-sm font-semibold text-slate-900">التعليم</h3>
                    <ul className="space-y-2">
                      {form.education.map((x, i) => (
                        <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                          <p className="font-semibold text-slate-900">
                            {x.degree}
                            {x.institution ? ` — ${x.institution}` : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {[x.location, [x.start_date, x.end_date].filter(Boolean).join(" - ")].filter(Boolean).join(" · ")}
                          </p>
                          {x.description && <p className="mt-1 text-slate-600">{x.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* القسم الثاني والثالث */}
          <aside className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <HiSparkles className="text-amber-600" size={20} />
                اقتراحات الذكاء الاصطناعي
              </h2>

              {status !== "completed" ? (
                <p className="mt-3 text-sm text-slate-600">
                  بعد تحليل سيرتك الذاتية تظهر هنا اقتراحات التطوير.
                </p>
              ) : (
                <>
                  <div className="mt-4 flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="الوظيفة المستهدفة (اختياري)"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                    <button onClick={fetchRecs} disabled={recsLoading} className={`${btnPrimary} shrink-0 px-4`}>
                      {recsLoading ? <FiLoader className="animate-spin" /> : <HiSparkles />}
                      {recs ? "تحديث" : "اقتراحات"}
                    </button>
                  </div>
                  {recsError && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <FiAlertCircle className="mt-0.5 shrink-0" />
                      {recsError}
                    </p>
                  )}
                  {recsLoading && !recs && (
                    <p className="mt-4 text-sm text-slate-600">جارٍ تجهيز الاقتراحات…</p>
                  )}
                  {recs && <Recommendations recs={recs} skills={form.skills} onAddSkill={addSkill} />}
                </>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">مدة صلاحية رابط المشاركة</label>
              <select
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className={inputCls}
                disabled={status !== "completed"}
              >
                <option value="">بدون انتهاء</option>
                <option value="7">7 أيام</option>
                <option value="30">30 يوماً</option>
                <option value="90">90 يوماً</option>
              </select>
              <button
                onClick={approve}
                disabled={status !== "completed" || approving}
                className={`${btnPrimary} mt-4 w-full py-3.5`}
              >
                {approving ? <FiLoader className="animate-spin" size={18} /> : <FiCheck size={18} />}
                اعتماد الـ CV والتحديث
              </button>
              <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
                <FiInfo className="mt-0.5 shrink-0" />
                {isLocalAI
                  ? "تعديلاتك ونتيجة التحليل محفوظة في هذا المتصفح فقط، فيعرضها الرابط المشترك على هذا الجهاز."
                  : "الرابط يعرض نتيجة التحليل المحفوظة في السيرفر. تعديلاتك على الحقول تبقى في هذه الصفحة فقط حالياً."}
              </p>
            </section>
          </aside>
        </div>
      </main>

      {shareInfo && (
        <ShareModal
          link={shareInfo.link}
          expiresAt={shareInfo.expiresAt}
          onClose={() => {
            setShareInfo(null);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}
