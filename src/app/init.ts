import axios from "axios";

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

export const fetchAuthToken = async () => {
  try {
    const response = await apiInstance.get("/api/auth-token");
    const token = response.data.token;
    apiInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (error) {
    console.error("Failed to fetch auth token:", error);
  }
};

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
