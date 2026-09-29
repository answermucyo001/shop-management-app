import axios from 'axios';
// One Axios instance: adds the JWT to every request, logs out on 401.
// Note: localStorage is simple but readable by scripts on the page; fine for an internal shop app.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((c) => { const tk = localStorage.getItem('token'); if (tk) c.headers.Authorization = 'Bearer ' + tk; return c; });
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && !e.config.url.includes('/auth/login')) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(e);
});
export default api;
