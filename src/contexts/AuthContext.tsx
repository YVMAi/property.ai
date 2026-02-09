import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'user';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresMfa?: boolean }>;
  verifyMfa: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  checkEmail: (email: string) => Promise<{ exists: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated users for demo
const DEMO_USERS = [
  { id: '1', email: 'admin@propertyai.com', password: 'password123', name: 'Admin User', role: 'admin' as UserRole },
  { id: '2', email: 'manager@propertyai.com', password: 'password123', name: 'Property Manager', role: 'user' as UserRole },
];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('propertyai_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Track user activity for auto-logout
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      if (user && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  const checkEmail = async (email: string): Promise<{ exists: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const exists = DEMO_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    return { exists };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; requiresMfa?: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    
    const foundUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    // Store pending user for MFA verification
    setPendingUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role });
    
    return { success: true, requiresMfa: true };
  };

  const verifyMfa = async (code: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API call
    
    // Accept any 6-digit code for demo (in production, verify against sent code)
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return { success: false, error: 'Invalid MFA code. Please enter 6 digits.' };
    }

    // For demo, accept code "123456" or any 6-digit number
    if (pendingUser) {
      setUser(pendingUser);
      localStorage.setItem('propertyai_user', JSON.stringify(pendingUser));
      setPendingUser(null);
      return { success: true };
    }

    return { success: false, error: 'Session expired. Please login again.' };
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    localStorage.removeItem('propertyai_user');
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    
    const exists = DEMO_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return { success: false, error: 'Email not found in our system.' };
    }

    // In production, send actual email
    return { success: true };
  };

  const resetPassword = async (_token: string, _newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    // In production, verify token and update password
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      verifyMfa,
      logout,
      requestPasswordReset,
      resetPassword,
      checkEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
