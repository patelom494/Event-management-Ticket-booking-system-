import axios from "axios";
import { getHeaders } from "../auth/authService";

const BASE = "http://localhost:8000";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const signup = (d) => axios.post(`${BASE}/signup`, d);
export const login = (d) => axios.post(`${BASE}/login`, d);
export const logout = () => axios.get(`${BASE}/logout`, { headers: getHeaders() });
export const changePassword = (d) => axios.post(`${BASE}/changePassword`, d);

// ── Public ────────────────────────────────────────────────────────────────────
export const getCategories = () => axios.get(`${BASE}/categories`);
export const getEvents = (p) => axios.get(`${BASE}/events`, { params: p });
export const getEventDetails = (id) => axios.get(`${BASE}/events/${id}`);
export const getReviews = () => axios.get(`${BASE}/reviews`);

// ── User (JWT required) ───────────────────────────────────────────────────────
export const getProfile = () => axios.get(`${BASE}/user/profile`, { headers: getHeaders() });
export const updateProfile = (d) => axios.post(`${BASE}/user/updateProfile`, d, { headers: getHeaders() }); // FormData
export const bookEvent = (d) => axios.post(`${BASE}/user/bookEvent`, d, { headers: getHeaders() });
export const myBookings = () => axios.get(`${BASE}/user/myBookings`, { headers: getHeaders() });
export const cancelBooking = (d) => axios.post(`${BASE}/user/cancelBooking`, d, { headers: getHeaders() });
export const genOrderId = (d) => axios.post(`${BASE}/user/genOrderId`, d, { headers: getHeaders() });
export const verifyPayment = (d) => axios.post(`${BASE}/user/verifyPayment`, d, { headers: getHeaders() });
export const addReview = (d) => axios.post(`${BASE}/user/addReview`, d, { headers: getHeaders() });
export const addComplaint = (d) => axios.post(`${BASE}/user/addComplaint`, d, { headers: getHeaders() });
export const myComplaints = () => axios.get(`${BASE}/user/myComplaints`, { headers: getHeaders() });
