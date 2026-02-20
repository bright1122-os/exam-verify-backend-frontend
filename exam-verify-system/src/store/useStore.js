import { create } from 'zustand';
import api from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Helper: extract token+user from either response format:
//   { token, user }          ← monorepo server
//   { data: { token, user }} ← standalone backend
function parseAuthResponse(res) {
  const token = res.token ?? res.data?.token;
  const user = res.user ?? res.data?.user;
  return { token, user };
}

// Helper: extract user from getMe response:
//   { data: user }          ← monorepo server (user directly in data)
//   { data: { user } }      ← standalone backend
function parseUserResponse(res) {
  if (res.data?.id || res.data?._id) return res.data;      // monorepo: data IS the user
  if (res.data?.user) return res.data.user;                 // standalone: data.user
  return res.user ?? null;
}

export const useStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  userType: null,
  loading: true,
  studentData: null,

  // Initialize auth from stored token on app load
  initializeAuth: async () => {
    set({ loading: true });
    const token = localStorage.getItem('token');

    if (!token) {
      set({ user: null, isAuthenticated: false, userType: null, loading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const user = parseUserResponse(res);
      set({ user, isAuthenticated: true, userType: user.role, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, userType: null, loading: false });
    }
  },

  // Sign in with email/password
  signIn: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = parseAuthResponse(res);
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, userType: user.role });
    return user;
  },

  // Sign up with email/password
  signUp: async (email, password, metadata = {}) => {
    const res = await api.post('/auth/register', {
      name: metadata.name,
      email,
      password,
      role: metadata.role || 'student',
    });
    const { token, user } = parseAuthResponse(res);
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, userType: user.role });
    return user;
  },

  // Google OAuth — redirect to backend
  signInWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Set auth from token (used by AuthCallback for Google OAuth)
  setAuthFromToken: async (token) => {
    localStorage.setItem('token', token);
    try {
      const res = await api.get('/auth/me');
      const user = parseUserResponse(res);
      set({ user, isAuthenticated: true, userType: user.role });
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore errors
    }
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, userType: null, studentData: null });
  },

  // Update student data in store
  updateStudentData: (data) => {
    set((state) => ({
      studentData: { ...state.studentData, ...data },
    }));
  },
}));
