

export const read = (k, fb) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fb;
  } catch {
    return fb;
  }
};
export const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const uid = () => Math.random().toString(36).slice(2, 8);
export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join(" ");

export const shareUrl = (id) => `${window.location.origin}/s/${id}`;
