import { HiSparkles } from "react-icons/hi2";

export default function Logo({ light }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid size-9 place-items-center rounded-xl ${
          light ? "bg-white/15 text-white" : "bg-teal-800 text-white"
        }`}
      >
        <HiSparkles size={19} />
      </span>
      <span className={`text-lg font-bold ${light ? "text-white" : "text-slate-900"}`}>
        AI Resume Builder
      </span>
    </span>
  );
}
