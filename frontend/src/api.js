// Client API centralisé : préfixe l'URL du backend et joint le token JWT à chaque requête.
export const API_URL = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'artstock_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => Boolean(getToken());

export async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    // Token absent/expiré : retour à la page de connexion
    if (res.status === 401 && window.location.pathname !== '/login') {
        clearToken();
        window.location.href = '/login';
    }
    return res;
}

export async function login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Connexion impossible');
    setToken(data.token);
    return data.user;
}

export function logout() {
    clearToken();
    window.location.href = '/login';
}
