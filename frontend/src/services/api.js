import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // Backend URL
  headers: { "Content-Type": "application/json" },
});
API.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token");
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      sessionStorage.clear();
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default API;
