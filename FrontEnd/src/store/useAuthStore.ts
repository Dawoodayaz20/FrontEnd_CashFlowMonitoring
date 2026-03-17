import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string
}

interface AuthState  {
    user: User | null;
    email: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    setEmail: (email: User) => void;
}

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
