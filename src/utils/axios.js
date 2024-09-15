import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3500/", // Replace with your actual base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
