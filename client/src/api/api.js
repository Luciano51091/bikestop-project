import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bikestop-backend.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
