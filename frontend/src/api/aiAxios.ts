import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// AI requests go through the API Gateway (8080) under /api/ai.
const AI_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL ?? "http://localhost:8080/api/ai";

export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
});

aiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AI API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
