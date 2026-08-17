import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// JWT REQUEST INTERCEPTOR
// =========================================================

API.interceptors.request.use(
  (config) => {

    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

API.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error?.response?.status === 401) {

      sessionStorage.clear();

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default API;