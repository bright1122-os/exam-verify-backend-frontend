import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  userType: null, // 'student', 'examiner', 'admin'
  loading: true,

  // Student specific data
  studentData: null,

  // Initialize Auth Listener
  initializeAuth: async () => {
    set({ loading: true });

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      set({ session, user: session.user, isAuthenticated: true });
      await get().fetchProfile(session.user.id);
    } else {
      set({ user: null, session: null, isAuthenticated: false, loading: false });
    }

    // Listen for changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        set({ session, user: session.user, isAuthenticated: true });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, session: null, isAuthenticated: false, userType: null, studentData: null, loading: false });
      }
    });
  },

  // Fetch user profile from Supabase 'profiles' or 'students' table
  fetchProfile: async (userId) => {
    try {
      const session = get().session;
      let role = null;

      // 1. Try to get role from 'profiles' table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        role = profile.role;
      } else if (session?.user?.user_metadata?.role) {
        // Fallback to metadata if profile doesn't exist yet
        role = session.user.user_metadata.role;
        console.log('Using metadata role:', role);
      }

      set({ userType: role });

      if (role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', userId)
          .single();

        set({ studentData: student });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to metadata in case of error
      const session = get().session;
      if (session?.user?.user_metadata?.role) {
        set({ userType: session.user.user_metadata.role });
      }
    } finally {
      set({ loading: false });
    }
  },

  // Login
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  // Google Login
  signInWithGoogle: async (redirectTo = window.location.origin) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectTo}/auth/callback`,
      }
    });
    if (error) throw error;
  },

  // Sign Up
  signUp: async (email, password, metadata = {}) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
  },

  // Logout
  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

