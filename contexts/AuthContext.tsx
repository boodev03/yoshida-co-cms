"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authenticateUser } from "@/services/auth";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
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

  const signIn = async (username: string, password: string): Promise<void> => {
    // Authenticate against D1 database using the new pattern
    const authResult = await authenticateUser(username, password);

    if (!authResult.success) {
      // Throw the error message for the UI to catch and display
      throw new Error(authResult.error || 'Authentication failed');
    }

    if (!authResult.user) {
      throw new Error('No user data received');
    }

    const userData: User = {
      id: authResult.user.id.toString(),
      username: authResult.user.username
    };

    // Store in localStorage and state
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
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