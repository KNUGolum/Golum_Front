const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8002/api";
const TOKEN_STORAGE_KEY = "golum_tokens";

let tokens = readStoredTokens();

function readStoredTokens() {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getTokens() {
  return tokens;
}

export function setTokens(nextTokens) {
  tokens = nextTokens;
  if (nextTokens) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(nextTokens));
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function clearTokens() {
  setTokens(null);
}

export async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("백엔드 서버에 연결할 수 없습니다.");
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).filter(Boolean).join(", ")
      : detail || data?.message || "API 요청에 실패했습니다.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
