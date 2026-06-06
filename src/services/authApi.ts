import axios from 'axios';

// login/signup 전용 — 401 global redirect 인터셉터 없음
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default authApi;
