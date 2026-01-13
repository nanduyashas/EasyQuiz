import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptor (Auto add token)
axiosInstance.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");
    let token = localStorage.getItem("token");

    // If token isn't separately stored, try inside user object
    if (!token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        token = user?.token || user?.accessToken;
      } catch (e) {
        token = null;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // DO NOT set Content-Type manually for multipart
    // axios detects it automatically
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
