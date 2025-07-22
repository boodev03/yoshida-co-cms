"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Hardcoded users for development
const HARDCODED_USERS = [
  {
    id: '1',
    email: 'admin@yoshida.co',
    password: 'admin123',
    name: 'Admin User'
  },
  {
    id: '2', 
    email: 'editor@yoshida.co',
    password: 'editor123',
    name: 'Editor User'
  }
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Find user in hardcoded list
      const foundUser = HARDCODED_USERS.find(
        u => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name
      };

      // Store in localStorage and state
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);

    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('auth_user');
      setUser(null);
    } catch (error) {
      throw new Error("Failed to sign out");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};