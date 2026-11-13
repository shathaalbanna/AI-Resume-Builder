import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiUploadCloud, FiCheck, FiPlus, FiX, FiArrowRight, FiBriefcase } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { shareUrl } from "../utils/helpers";
import { EXTRACTED, SUGGESTIONS } from "../data/mock";
import { useApp } from "../context/AppContext";
import { inputCls, btnPrimary, btnGhost } from "../styles";
import Input from "../components/Input";
import Navbar from "../components/Navbar";
import ShareModal from "../components/ShareModal";
import Stepper from "../components/Stepper";

export default function CreateCV() {
  const { addCv } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: "",
    skills: [],
    summary: "",
  });
  const [applied, setApplied] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [shareLink, setShareLink] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      alert("الملفات المدعومة: PDF أو Word");
      return;
    }
    setFileName(file.name);
    setUploaded(false);
    setApplied([]);
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => {
          setForm(EXTRACTED);
          setUploaded(true);
          setProgress(null);
        }, 300);
      }
    }, 250);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    setForm((f) => ({ ...f, skills: [...new Set([...f.skills, v])] }));
    setSkillInput("");
  };

  const approve = () => {
    const cv = addCv(form);
    setShareLink(shareUrl(cv.id));
  };

  const step = shareLink ? 3 : uploaded ? 2 : 1;

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
          {/* القسم الأول */}
          <section className="space-y-5 lg:col-span-3">
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
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
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
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <FiUploadCloud className="mx-auto text-teal-700" size={38} />
              <p className="mt-3 font-semibold text-slate-800">
                اسحب ملف السيرة الذاتية هنا أو اضغط للاختيار
              </p>
              <p className="mt-1 text-sm text-slate-500">PDF أو Word</p>

              {progress !== null && (
                <div className="mx-auto mt-5 max-w-xs">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">جارٍ تحليل {fileName}…</p>
                </div>
              )}
              {uploaded && progress === null && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
                  <FiCheck size={15} />
                  تم تحليل «{fileName}» وتعبئة الحقول
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">بيانات السيرة الذاتية</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input icon={FiUser} label="الاسم الكامل" value={form.fullName} onChange={set("fullName")} />
                <Input icon={FiBriefcase} label="المسمى الوظيفي" value={form.jobTitle} onChange={set("jobTitle")} />
                <Input icon={FiMail} label="البريد الإلكتروني" type="email" value={form.email} onChange={set("email")} />
                <Input icon={FiPhone} label="رقم الهاتف" value={form.phone} onChange={set("phone")} />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  المهارات الأساسية
                </label>
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
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button onClick={addSkill} className={`${btnGhost} shrink-0`}>
                    <FiPlus size={16} />
                    إضافة
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">نبذة عني</label>
                <textarea rows={4} className={inputCls} value={form.summary} onChange={set("summary")} />
              </div>
            </div>
          </section>

          {/* القسم الثاني والثالث */}
          <aside className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <HiSparkles className="text-amber-600" size={20} />
                اقتراحات الذكاء الاصطناعي
              </h2>
              {!uploaded ? (
                <p className="mt-3 text-sm text-slate-600">
                  ارفع سيرتك الذاتية لتظهر لك اقتراحات التطوير.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {SUGGESTIONS.map((s) => {
                    const done = applied.includes(s.id);
                    return (
                      <li key={s.id} className="rounded-xl border border-amber-100 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.detail}</p>
                        <button
                          disabled={done}
                          onClick={() => {
                            setForm(s.apply);
                            setApplied((a) => [...a, s.id]);
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-teal-800 px-3 py-1.5 text-xs font-medium text-teal-800 transition hover:bg-teal-50 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
                        >
                          {done ? <FiCheck size={13} /> : <HiSparkles size={13} />}
                          {done ? "تم التطبيق" : "تطبيق الاقتراح"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <button onClick={approve} disabled={!uploaded} className={`${btnPrimary} w-full py-3.5`}>
              <FiCheck size={18} />
              اعتماد الـ CV والتحديث
            </button>
          </aside>
        </div>
      </main>

      {shareLink && (
        <ShareModal
          link={shareLink}
          onClose={() => {
            setShareLink(null);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}
