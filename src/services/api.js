import axios from "axios";
export const API_URL = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "arb_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};
const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
  timeout: 30000,
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use((config) => {
  const t = tokenStore.get();
  const isPublic = (config.url || "").includes("/shared-resumes");
  if (t && !isPublic) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || "";
    const isAuthCall =
      url.includes("/cv/auth/login") || url.includes("/cv/auth/register");
    if (error.response?.status === 401 && !isAuthCall) onUnauthorized();
    return Promise.reject(error);
  }
);

const hf = (token) => ({ "X-HuggingFace-Token": token });

export const authApi = {
  register: (body) => api.post("/cv/auth/register", body).then((r) => r.data.data),
  login: (body) => api.post("/cv/auth/login", body).then((r) => r.data.data),
  logout: () => api.post("/cv/auth/logout"),
  profile: () => api.get("/cv/auth/profile").then((r) => r.data.data),
};

export const resumesApi = {
  list: (page = 1, perPage = 9) =>
    api
      .get("/cv/resumes", { params: { page, per_page: perPage } })
      .then((r) => r.data), 

  upload: (file, title) => {
    const fd = new FormData();
    if (title) fd.append("title", title);
    fd.append("file", file);
    return api.post("/cv/resumes", fd, { timeout: 120000 }).then((r) => r.data.data);
  },

  remove: (id) => api.delete(`/cv/resumes/${id}`),

  fileBlob: (id) =>
    api.get(`/cv/resumes/${id}/file`, { responseType: "blob" }).then((r) => r.data),

  analyze: (id, hfToken) =>
    api
      .post(`/cv/resumes/${id}/analyze`, null, { headers: hf(hfToken), timeout: 180000 })
      .then((r) => r.data.data),

  recommendations: (id, hfToken, targetRole) =>
    api
      .post(
        `/cv/resumes/${id}/recommendations`,
        { target_role: targetRole || null },
        { headers: hf(hfToken), timeout: 180000 }
      )
      .then((r) => r.data.data.recommendations),

  share: (id, days) =>
    api
      .post(`/cv/resumes/${id}/share`, days ? { expires_in_days: days } : {})
      .then((r) => r.data.data),

  unshare: (id) => api.delete(`/cv/resumes/${id}/share`),
};

export const sharedApi = {
  get: (token) => api.get(`/cv/shared-resumes/${token}`).then((r) => r.data.data),
  fileUrl: (token, download = false) =>
    `${API_URL}/cv/shared-resumes/${token}/file${download ? "?download=1" : ""}`,
};
