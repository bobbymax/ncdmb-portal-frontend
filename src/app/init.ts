import axios from "axios";
import Cookies from "js-cookie";
import TokenProvider from "lib/TokenProvider";
import { AuthProvider } from "./Providers/AuthProvider";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const apiInstance = axios.create({
  baseURL: "https://portal.test",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle session expiry globally
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Session expired - clear all auth data
      TokenProvider.getInstance().clearToken();
      const authProvider = new AuthProvider();
      authProvider.logout();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

const getCsrfToken = async (): Promise<void> => {
  try {
    // Initializing CSRF token

    const response = await apiInstance.get("/sanctum/csrf-cookie");
    // CSRF token initialized successfully

    // Check if CSRF token was set
    const xsrfToken = Cookies.get("XSRF-TOKEN");
    // XSRF-TOKEN cookie status checked
  } catch (error: any) {
    // Failed Getting CSRF Token
    console.error("Error getting CSRF token:", error);
  }
};

// Note: fetchAuthToken removed - now using chat-specific tokens via TokenProvider.fetchChatToken()

export const loginStaff = async (data: {
  username: string;
  password: string;
}) => {
  try {
    await getCsrfToken();

    // Attempting login

    const response = await apiInstance.post("/api/login", data);
    // Login successful

    return response;
  } catch (error: any) {
    // Failed logging staff in
    console.error("Error logging staff in:", error);
    throw error; // Re-throw to be caught by the Login component
  }
};

export const getLoggedInUser = async () => {
  return apiInstance.get("api/user");
};

export default apiInstance;
