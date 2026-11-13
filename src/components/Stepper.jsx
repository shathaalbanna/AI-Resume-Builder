import { FiCheck } from "react-icons/fi";

export default function Stepper({ step }) {
  const steps = ["رفع الملف", "مراجعة وتحسين", "اعتماد ومشاركة"];
  return (
    <ol className="mb-8 flex items-center gap-2 sm:gap-4">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                done
                  ? "bg-teal-800 text-white"
                  : active
                  ? "bg-teal-100 text-teal-800 ring-2 ring-teal-800"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? <FiCheck size={16} /> : n}
            </span>
            <span
              className={`hidden text-sm sm:block ${
                active || done ? "font-semibold text-slate-800" : "text-slate-400"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-300" />}
          </li>
        );
      })}
    </ol>
  );
}
