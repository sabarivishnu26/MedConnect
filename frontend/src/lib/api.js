import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  // Keep this as a hard failure so misconfig is obvious.
  // Set VITE_API_URL in `frontend/.env` (or your shell) to something like: http://localhost:4000
  throw new Error("Missing VITE_API_URL (set it in frontend/.env)");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});
