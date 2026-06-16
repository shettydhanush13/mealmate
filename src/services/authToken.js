// Central auth-token store + global axios wiring.
//
// On OTP verify the backend returns a signed JWT; we keep it in localStorage and
// attach it as `Authorization: Bearer <token>` on every request via a single
// axios interceptor. Staff endpoints require it; public endpoints ignore it.
import axios from 'axios';

const TOKEN_KEY = 'ck_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable — interceptor just sends no token */ }
};

export const clearToken = () => setToken('');

// Install once at app startup. Attaches the Bearer token to outgoing requests.
let installed = false;
export const installAuthInterceptor = () => {
  if (installed) return;
  installed = true;
  axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
