import axios from "axios";

const BASE = "http://localhost:8000";

export const getToken = () => localStorage.getItem("event_token");
export const setToken = (t) => localStorage.setItem("event_token", t);
export const removeToken = () => localStorage.removeItem("event_token");
export const getHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

const checkSession = async () => {
  const token = getToken();
  if (!token) return { isAuth: false, session: null };
  try {
    const res = await axios.get(`${BASE}/session`, { headers: getHeaders() });
    return { isAuth: true, session: res.data.userData?.session || null };
  } catch {
    removeToken();
    return { isAuth: false, session: null };
  }
};

export default checkSession;
