import axios from "axios";

const accessPoint = axios.create({
  baseURL: "https://portal.test",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const initializeCsrfToken = async (): Promise<void> => {
  try {
    await accessPoint.get("/sanctum/csrf-cookie");
    // console.log(Cookies.get.length);
  } catch (error) {
    console.error("Failed to get CSRF cookie:", error);
  }
};

export const authenticate = async (username: string, password: string) => {
  try {
    await initializeCsrfToken();
    await accessPoint.post("/api/login", { username, password });
  } catch (error) {
    // Error in service initialization
  }
};

export default accessPoint;

// AI Service exports
export { default as AIService } from "./AIService";
