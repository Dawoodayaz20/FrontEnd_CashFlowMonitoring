import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../authentication/auth.types';

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      email: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setEmail: (email) => set({email})
    }),
    {
      name: 'auth-storage', // 👈 key in localStorage
    }
  )
);

export default useAuthStore;
