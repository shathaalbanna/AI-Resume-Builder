import { FiCheck, FiPlus } from "react-icons/fi";

const PRIORITY = {
  high: ["عالية", "bg-rose-100 text-rose-700"],
  medium: ["متوسطة", "bg-amber-100 text-amber-800"],
  low: ["منخفضة", "bg-slate-100 text-slate-600"],
};

function Priority({ value }) {
  const [label, cls] = PRIORITY[value] || PRIORITY.low;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function ScoreRing({ score }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(Number(score) || 0, 0), 100);
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 72 72" className="size-16 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-slate-200" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="stroke-teal-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold text-slate-900">
        {pct}
      </span>
    </div>
  );
}

export default function Recommendations({ recs, skills, onAddSkill }) {
  const improvements = recs.cv_improvements ?? [];
  const recSkills = recs.recommended_skills ?? [];
  const strengths = recs.strengths ?? [];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-amber-100 bg-white p-4">
        <ScoreRing score={recs.overall_score} />
        <p className="text-sm leading-relaxed text-slate-700">{recs.summary}</p>
      </div>

      {strengths.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">نقاط القوة</h3>
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((s) => (
              <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {improvements.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">اقتراحات التحسين</h3>
          <ul className="space-y-2">
            {improvements.map((it, i) => (
              <li key={i} className="rounded-xl border border-amber-100 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{it.section}</span>
                  <Priority value={it.priority} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{it.issue}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{it.recommendation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recSkills.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">مهارات مقترحة</h3>
          <ul className="space-y-2">
            {recSkills.map((s) => {
              const has = skills.some((x) => x.toLowerCase() === s.skill.toLowerCase());
              return (
                <li key={s.skill} className="rounded-xl border border-amber-100 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{s.skill}</span>
                      <Priority value={s.priority} />
                    </div>
                    <button
                      disabled={has}
                      onClick={() => onAddSkill(s.skill)}
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-800 px-2.5 py-1 text-xs font-medium text-teal-800 transition hover:bg-teal-50 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
                    >
                      {has ? <FiCheck size={12} /> : <FiPlus size={12} />}
                      {has ? "مضافة" : "إضافة"}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.reason}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
