export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join(" ");

export const shareTokenFromUrl = (url) =>
  url.split("?")[0].split("/").filter(Boolean).pop();

export const frontShareLink = (shareUrl) =>
  `${window.location.origin}/s/${shareTokenFromUrl(shareUrl)}`;

export const mapDraft = (draft) => {
  const d = draft || {};
  return {
    fullName: d.full_name ?? "",
    jobTitle: d.job_title ?? "",
    summary: d.professional_summary ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    location: d.location ?? "",
    linkedin: d.linkedin_url ?? "",
    github: d.github_url ?? "",
    skills: d.skills ?? [],
    experience: d.experience ?? [],
    education: d.education ?? [],
  };
};

// حالة الفورم → شكل profile_draft (للوضع التجريبي)
export const formToDraft = (f) => ({
  full_name: f.fullName || null,
  job_title: f.jobTitle || null,
  professional_summary: f.summary || null,
  email: f.email || null,
  phone: f.phone || null,
  location: f.location || null,
  linkedin_url: f.linkedin || null,
  github_url: f.github || null,
  skills: f.skills,
  experience: f.experience,
  education: f.education,
});

export const validateFile = (f) => {
  if (!/\.(pdf|docx?)$/i.test(f.name)) return "الملفات المدعومة: PDF أو DOC أو DOCX";
  if (f.size > 10 * 1024 * 1024) return "حجم الملف يتجاوز 10MB";
  return "";
};

export class UserError extends Error {
  constructor(message) {
    super(message);
    this.userMessage = message;
  }
}

// يحوّل خطأ axios أو UserError إلى { message, fields }
export const parseError = (e) => {
  if (e instanceof UserError) return { message: e.userMessage, fields: {} };
  if (!e?.response) {
    return {
      message:
        e?.code === "ECONNABORTED"
          ? "انتهت مهلة الطلب، حاول مرة أخرى"
          : "تعذّر الاتصال بالسيرفر، تحقق من الإنترنت",
      fields: {},
    };
  }
  const d = e.response.data || {};
  const fields = {};
  if (d.errors && typeof d.errors === "object") {
    for (const [k, v] of Object.entries(d.errors)) {
      fields[k] = Array.isArray(v) ? v[0] : String(v);
    }
  }
  return {
    message: d.message || "حدث خطأ غير متوقع",
    fields,
    status: e.response.status,
  };
};
