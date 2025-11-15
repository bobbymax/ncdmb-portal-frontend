import axios from "axios";
import Cookies from "js-cookie";
import TokenProvider from "lib/TokenProvider";
import { AuthProvider } from "./Providers/AuthProvider";
import {
  errorService,
  ErrorCategory,
  ErrorSeverity,
} from "./Services/ErrorService";
import { createErrorFromAxios } from "./Errors/AppErrors";

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
  // timeout: 30000, // 30 second timeout
});

// Add request interceptor for logging
apiInstance.interceptors.request.use(
  (config) => {
    // Add request timestamp for performance tracking
    (config as any).metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with enhanced error handling
apiInstance.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === "development") {
      const duration =
        Date.now() - ((response.config as any).metadata?.startTime || 0);
      if (duration > 1000) {
        console.warn(
          `Slow API call: ${response.config.url} took ${duration}ms`
        );
      }
    }
    return response;
  },
  (error) => {
    // Create typed error
    const appError = createErrorFromAxios(error);
    const url = error.config?.url || "";

    // Skip logging for expected 401/403 errors that are not actual problems
    const isExpectedAuthError =
      (error.response?.status === 401 || error.response?.status === 403) &&
      (url.includes("api/user") ||
        url.includes("api/documents") ||
        url.includes("api/settings") ||
        url.includes("api/notifications") ||
        url.includes("api/inbounds") ||
        url.includes("broadcasting/auth") ||
        url.includes("/login") ||
        url.includes("/logout") ||
        url.includes("/sanctum/csrf-cookie"));

    // Log to error service (skip expected auth failures)
    if (!isExpectedAuthError) {
      errorService.logError({
        message: appError.message,
        category: appError.category as ErrorCategory,
        severity: errorService.determineSeverity(
          appError.category as ErrorCategory,
          appError.code
        ),
        code: appError.code,
        context: appError.context,
        originalError: error,
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't auto-logout for expected auth failures (session checks, etc)
      if (isExpectedAuthError) {
        return Promise.reject(appError);
      }

      // Session expired - clear all auth data
      TokenProvider.getInstance().clearToken();
      const authProvider = new AuthProvider();
      authProvider.logout();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(appError);
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
