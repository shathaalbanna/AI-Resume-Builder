import { HiSparkles } from "react-icons/hi2";
import Logo from "../components/Logo";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* لوحة جانبية */}
      <aside
        className="relative hidden overflow-hidden bg-teal-900 p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <Logo light />

        <div className="relative mx-auto my-10 w-full max-w-sm">
          {/* بطاقة CV تجريبية */}
          <div className="-rotate-3 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">
                ل أ
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-slate-800" />
                <div className="h-2 w-24 rounded bg-slate-300" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="h-2 w-11/12 rounded bg-slate-200" />
              <div className="h-2 w-8/12 rounded bg-slate-200" />
            </div>
            <div className="mt-5 flex gap-2">
              {["React", "UX", "Git"].map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          {/* اقتراح AI */}
          <div className="absolute -bottom-6 -start-6 flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 shadow-xl">
            <HiSparkles className="text-amber-600" size={18} />
            حسّن المسمى الوظيفي
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug">
            سيرتك الذاتية، بأفضل صياغة.
          </h2>
          <p className="mt-3 max-w-md text-teal-100/80">
            ارفع سيرتك الحالية، واحصل على اقتراحات ذكية لتطويرها، ثم شاركها برابط
            واحد.
          </p>
        </div>
      </aside>

      {/* النموذج */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1.5 mb-7 text-slate-500">{subtitle}</p>
          {children}
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
      </section>
    </main>
  );
}
