import axios from "axios";

const accessPoint = axios.create({
  baseURL: process.env.REACT_API_ENDPOINT ?? "https://portal.test",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default accessPoint;
