import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '../types';
import { Role } from '../types';
import { api } from '../services/api';

export type Page = 
  'landing' | 'login' | 'signup' | 
  'dashboard' | 
  'bills' | 'bills-all' | 'bills-rent' | 'bills-electricity' | 'bills-water' | 'bills-gas' | 'bills-wifi' | 'bills-maid' | 'bills-others' |
  'meals' | 'shopping' | 'calendar' | 'menu' |
  'members' | 'history' | 'reports-analytics' | 'payment-dashboard' | 'pending-approvals' | 'settings';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  page: Page;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  login: (email: string, pass: string) => Promise<User | null>;
  signup: (name: string, email: string, pass: string, role: Role) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    // Mock checking for an existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('dashboard');
    } else {
      setPage('landing');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedInUser = await api.login(email, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setPage('dashboard'); // This will trigger routing logic in App.tsx
    }
    return loggedInUser;
  };

  const signup = async (name: string, email: string, pass: string, role: Role) => {
    const newUser = await api.signup(name, email, pass, role);
    if (newUser) {
      setUser(newUser);
       localStorage.setItem('user', JSON.stringify(newUser));
       setPage('dashboard'); // This will trigger routing logic in App.tsx
    }
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setPage('landing');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, page, setPage, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};