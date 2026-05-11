import { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextType {
  email: string | null;
  userType: 'admin' | 'user' | null;
  login: (email: string, userType: 'admin' | 'user') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);

  const login = (email: string, userType: 'admin' | 'user') => {
    setEmail(email);
    setUserType(userType);
  };

  const logout = () => {
    setEmail(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ email, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used dentro do AuthProvider');
  }
  return context;
}