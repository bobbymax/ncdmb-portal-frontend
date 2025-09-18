import axios from "axios";
import Cookies from "js-cookie";
import TokenProvider from "lib/TokenProvider";

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

const getCsrfToken = async (): Promise<void> => {
  try {
    await apiInstance.get("/sanctum/csrf-cookie");
  } catch (error) {
    console.error("Failed Getting CSRF Token: ", error);
  }
};

// Note: fetchAuthToken removed - now using chat-specific tokens via TokenProvider.fetchChatToken()

export const loginStaff = async (data: {
  username: string;
  password: string;
}) => {
  try {
    await getCsrfToken();
    return apiInstance.post("api/login", data);
  } catch (error) {
    console.error("Failed logging staff in: ", error);
  }
};

export const getLoggedInUser = async () => {
  return apiInstance.get("api/user");
};

export default apiInstance;
