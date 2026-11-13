import { uid } from "../utils/helpers";

export const seedCvs = (ownerId, fullName, email) => [
  {
    id: uid(),
    ownerId,
    name: "سيرة ذاتية - مطوّر واجهات",
    updatedAt: "2026-11-02",
    data: {
      fullName,
      email,
      phone: "+972 598140474",
      jobTitle: "مطوّر واجهات أمامية",
      skills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
      summary:
        "مطوّر واجهات أمامية يبني تطبيقات ويب سريعة وسهلة الاستخدام، مع اهتمام بالأداء وإمكانية الوصول والعمل ضمن فرق متعددة التخصصات.",
    },
  },
  {
    id: uid(),
    ownerId,
    name: "CV - Product Designer",
    updatedAt: "2026-10-21",
    data: {
      fullName,
      email,
      phone: "+972 598140474",
      jobTitle: "مصمّم منتجات",
      skills: ["Figma", "UX Research", "Prototyping"],
      summary:
        "مصمّم منتجات يحوّل احتياجات المستخدمين إلى واجهات واضحة، ويعمل بشكل وثيق مع المطورين وفرق المنتج.",
    },
  },
];

export const EXTRACTED = {
  fullName: "شذا زاهر البنا",
  email: "shdhaalbna45@gmail.com",
  phone: "+972 598140474",
  jobTitle: "مطوّرة ويب",
  skills: ["React", "JavaScript", "CSS", "Git"],
  summary: "مطورة ويب لديها خبرة في بناء مواقع وتطبيقات متنوعة.",
};

export const SUGGESTIONS = [
  {
    id: "title",
    label: "تحسين المسمى الوظيفي",
    detail: "«مطوّرة ويب» ← «مطوّرة واجهات أمامية (React)»",
    apply: (f) => ({ ...f, jobTitle: "مطوّرة واجهات أمامية (React)" }),
  },
  {
    id: "summary",
    label: "إعادة صياغة نبذة الملخص",
    detail: "نبذة أوضح تركّز على الخبرة والأثر",
    apply: (f) => ({
      ...f,
      summary:
        "مطوّرة واجهات أمامية بخبرة في بناء تطبيقات React سريعة وسهلة الاستخدام، مع اهتمام بالأداء وتجربة المستخدم والعمل ضمن فرق متعددة التخصصات.",
    }),
  },
  {
    id: "skills",
    label: "إضافة مهارات مقترحة",
    detail: "TypeScript، Next.js، Tailwind CSS، Jest",
    apply: (f) => ({
      ...f,
      skills: [
        ...new Set([...f.skills, "TypeScript", "Next.js", "Tailwind CSS", "Jest"]),
      ],
    }),
  },
];
