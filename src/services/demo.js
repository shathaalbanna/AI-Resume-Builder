
const KEY = "arb_demo_drafts";

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

export const demoDrafts = {
  get: (resumeId) => readAll()[resumeId] || null,
  set: (resumeId, draft) =>
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [resumeId]: draft })),
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function demoAnalyze(user) {
  await wait(1500);
  return {
    full_name: user?.name || "اسم المستخدم",
    job_title: "مطوّر واجهات أمامية",
    professional_summary:
      "مطوّر واجهات أمامية بخبرة في بناء تطبيقات ويب باستخدام React، مهتم بتجربة المستخدم والعمل ضمن فريق.",
    email: user?.email || "",
    phone: "+970 599 000 000",
    location: "فلسطين",
    linkedin_url: null,
    github_url: null,
    skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    experience: [
      {
        job_title: "مطوّر واجهات",
        company: "شركة تجريبية",
        location: "رام الله",
        start_date: "2023",
        end_date: "2025",
        description: "تطوير واجهات ويب متجاوبة وربطها مع واجهات REST.",
      },
    ],
    education: [
      {
        degree: "بكالوريوس علم الحاسوب",
        institution: "جامعة تجريبية",
        location: "نابلس",
        start_date: "2019",
        end_date: "2023",
        description: null,
      },
    ],
  };
}

export async function demoRecommendations(targetRole) {
  await wait(1200);
  return {
    overall_score: 72,
    summary: targetRole
      ? `سيرتك مناسبة لوظيفة ${targetRole}، وتحتاج لإبراز الإنجازات بالأرقام.`
      : "سيرة جيدة بأساس تقني واضح، وتحتاج لإبراز الإنجازات بالأرقام.",
    strengths: ["React", "JavaScript", "العمل ضمن فريق"],
    cv_improvements: [
      {
        section: "Experience",
        priority: "high",
        issue: "الإنجازات غير مقاسة بالأرقام.",
        recommendation: "أضف أرقاماً مثل عدد المستخدمين أو نسبة تحسين الأداء.",
      },
      {
        section: "Professional Summary",
        priority: "medium",
        issue: "النبذة عامة.",
        recommendation: "اذكر التقنيات الأساسية وسنوات الخبرة.",
      },
      {
        section: "Links",
        priority: "low",
        issue: "لا توجد روابط LinkedIn أو GitHub.",
        recommendation: "أضف روابط حساباتك المهنية.",
      },
    ],
    recommended_skills: [
      { skill: "TypeScript", priority: "high", reason: "مطلوبة في أغلب وظائف الواجهات الحديثة." },
      { skill: "Next.js", priority: "medium", reason: "إطار شائع فوق React." },
      { skill: "Automated Testing", priority: "low", reason: "يرفع موثوقية الكود." },
    ],
  };
}
