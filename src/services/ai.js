import { resumesApi } from "./api";
import { demoAnalyze, demoDrafts, demoRecommendations } from "./demo";
import { GROQ_KEY, groqAnalyze, groqRecommendations } from "./groq";
import { extractCvText } from "./cvText";

const HF_TOKEN = (import.meta.env.VITE_HF_TOKEN ?? "").trim();
export const AI_MODE =
  import.meta.env.VITE_DEMO_MODE === "true"
    ? "demo"
    : GROQ_KEY
    ? "groq"
    : HF_TOKEN
    ? "hf"
    : "demo";

export const isLocalAI = AI_MODE !== "hf";

export async function analyzeCv({ resumeId, file, user }) {
  if (AI_MODE === "hf") {
    return (await resumesApi.analyze(resumeId, HF_TOKEN)).profile_draft;
  }
  const draft =
    AI_MODE === "groq" ? await groqAnalyze(await extractCvText(file)) : await demoAnalyze(user);
  demoDrafts.set(resumeId, draft);
  return draft;
}

export async function recommendCv({ resumeId, draft, targetRole }) {
  if (AI_MODE === "hf") return resumesApi.recommendations(resumeId, HF_TOKEN, targetRole);
  if (AI_MODE === "groq") return groqRecommendations(draft, targetRole);
  return demoRecommendations(targetRole);
}
