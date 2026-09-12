import axios from "axios";

function normalizeApiURL(url) {
  const trimmedUrl = url.trim().replace(/\/+$/, "");

  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
}

function getBaseURL() {
  const configuredUrl = process.env.REACT_APP_API_URL;

  if (configuredUrl) {
    return normalizeApiURL(configuredUrl);
  }

  return process.env.NODE_ENV === "production"
    ? "/api"
    : "https://medquanta-back1.onrender.com/api";
}

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medikiosk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
