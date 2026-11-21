import { UserError } from "../utils/helpers";

// الإعدادات من ملف .env
export const GROQ_KEY = (import.meta.env.VITE_GROQ_KEY ?? "").trim();
const BASE = (import.meta.env.VITE_GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
const MODEL = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";
const MAX_CV_CHARS = 12000;  
async function chatJson(system, user) {
  let res;
  try {
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new UserError(
      "تعذّر الاتصال بـ Groq. تحقق من الإنترنت، وإذا ظهر خطأ CORS في الـ Console استخدم الـ proxy."
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message || "";
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new UserError("مفتاح Groq غير صالح. تأكد من VITE_GROQ_KEY في ملف .env.");
    if (res.status === 429) throw new UserError("تجاوزت حد الاستخدام عند Groq. انتظر قليلاً ثم أعد المحاولة.");
    throw new UserError(`Groq رجّع خطأ (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  // شكل الرد (متوافق مع OpenAI): النص في choices[0].message.content
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new UserError("رد Groq فارغ. أعد المحاولة.");
  return parseJsonLoose(content);
}

export function parseJsonLoose(text) {
  const clean = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    /* جرّب استخراج الكائن */
  }
  const a = clean.indexOf("{");
  const b = clean.lastIndexOf("}");
  if (a !== -1 && b > a) {
    try {
      return JSON.parse(clean.slice(a, b + 1));
    } catch {
      
    }
  }
  throw new UserError("تعذّر قراءة رد الذكاء الاصطناعي (JSON غير صالح). أعد المحاولة.");
}

const str = (v) => {
  if (typeof v === "number") return String(v);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};

const strList = (v) => {
  if (typeof v === "string") return v.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : x?.name ?? x?.skill ?? ""))
    .filter(Boolean);
};

const objList = (v, keys) =>
  Array.isArray(v)
    ? v
        .filter((x) => x && typeof x === "object")
        .map((x) => Object.fromEntries(keys.map((k) => [k, str(x[k])])))
    : [];

export function normalizeDraft(d) {
  const x = d || {};
  return {
    full_name: str(x.full_name),
    job_title: str(x.job_title),
    professional_summary: str(x.professional_summary),
    email: str(x.email),
    phone: str(x.phone),
    location: str(x.location),
    linkedin_url: str(x.linkedin_url),
    github_url: str(x.github_url),
    skills: strList(x.skills),
    experience: objList(x.experience, ["job_title", "company", "location", "start_date", "end_date", "description"]),
    education: objList(x.education, ["degree", "institution", "location", "start_date", "end_date", "description"]),
  };
}

const prio = (v) => {
  const p = String(v || "").toLowerCase();
  return ["high", "medium", "low"].includes(p) ? p : "medium";
};

export function normalizeRecs(r) {
  const x = r || {};
  const score = Math.round(Number(x.overall_score));
  const list = (v) => (Array.isArray(v) ? v.filter((i) => i && typeof i === "object") : []);
  return {
    overall_score: Number.isFinite(score) ? Math.min(Math.max(score, 0), 100) : 0,
    summary: str(x.summary) || "",
    strengths: strList(x.strengths),
    cv_improvements: list(x.cv_improvements).map((i) => ({
      section: str(i.section) || "General",
      priority: prio(i.priority),
      issue: str(i.issue) || "",
      recommendation: str(i.recommendation) || "",
    })),
    recommended_skills: list(x.recommended_skills)
      .map((i) => ({ skill: str(i.skill) || "", priority: prio(i.priority), reason: str(i.reason) || "" }))
      .filter((i) => i.skill),
  };
}

/* البرومبت */
const ANALYZE_SYSTEM = `You extract structured data from CV (resume) text.
Respond with ONLY a valid JSON object (no markdown) with exactly these keys:
full_name, job_title, professional_summary, email, phone, location, linkedin_url, github_url,
skills (array of strings),
experience (array of objects with: job_title, company, location, start_date, end_date, description),
education (array of objects with: degree, institution, location, start_date, end_date, description).
Rules: use null for any missing single value and [] for missing lists. Never invent information.
Keep the original language of the CV. Dates as written in the CV (e.g. "2022").`;

const RECS_SYSTEM = `You are a career coach reviewing a CV profile.
Respond with ONLY a valid JSON object (no markdown) with exactly these keys:
overall_score (integer 0-100),
summary (short paragraph),
strengths (array of strings),
cv_improvements (array of objects: section, priority, issue, recommendation),
recommended_skills (array of objects: skill, priority, reason).
priority must be one of: "high", "medium", "low".
Write summary, issue, recommendation and reason in Arabic. Keep "section" and "skill" values in English.
Give 3 to 5 cv_improvements and 3 to 6 recommended_skills. Base everything on the given profile.`;

export async function groqAnalyze(cvText) {
  const data = await chatJson(ANALYZE_SYSTEM, `CV text:\n${cvText.slice(0, MAX_CV_CHARS)}`);
  return normalizeDraft(data);
}

export async function groqRecommendations(draft, targetRole) {
  const user = `Target role: ${targetRole || "(not specified, infer from the profile)"}\n\nProfile JSON:\n${JSON.stringify(draft)}`;
  const data = await chatJson(RECS_SYSTEM, user);
  return normalizeRecs(data);
}
