import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL; // Change this to your backend URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // timeout: 150000,
  headers: {
    "Cache-Control": "no-cache",
  },
});

// Add request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("accessToken");
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor to refresh token automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!navigator.onLine) {
      console.warn("Offline detected → suppressing toast");
      return Promise.reject(error);
    }

    // ✅ REQUEST TIMEOUT (Slow network)
    if (error.code === "ECONNABORTED") {
      toast.error("Network is slow. Request timed out.");
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error(
        "We’re unable to process your request at the moment. Please try again later. If the issue persists, please contact to your administrator.",
      );
      return Promise.reject(error);
    }

    // If the response is 401 (Unauthorized), try refreshing the token
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite loop
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        // const refreshToken = localStorage.getItem("refreshToken"); // Retrieve refresh token
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Call refresh token API
        const res = await axios.post(`${BASE_URL}/api/v1/auth/refreshToken`, {
          refreshToken,
        });

        const { data } = res.data;
        // Store new access token
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        // axiosInstance.defaults.headers.Authorization = `jwt ${res.data.accessToken}`;
        originalRequest.headers.Authorization = `jwt ${res.data.accessToken}`;
        return axiosInstance(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.clear();
        window.location.href = "/login"; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }
    // toast.error(
    //   error.response?.data?.message || "Something went wrong"
    // );
    return Promise.reject(error);
  },
);

export default axiosInstance;
