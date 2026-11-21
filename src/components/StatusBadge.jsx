const MAP = {
  pending: ["بانتظار التحليل", "bg-slate-100 text-slate-600"],
  processing: ["جارٍ التحليل", "bg-sky-100 text-sky-700"],
  completed: ["مكتمل", "bg-emerald-100 text-emerald-700"],
  failed: ["فشل التحليل", "bg-rose-100 text-rose-700"],
  demo: ["تحليل محلي", "bg-amber-100 text-amber-800"],
};

export default function StatusBadge({ status }) {
  const [label, cls] = MAP[status] || MAP.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
