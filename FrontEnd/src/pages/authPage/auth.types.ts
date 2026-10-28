export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string
}

export interface AuthState  {
    user: User | null;
    email: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    setEmail: (email: User) => void;
}