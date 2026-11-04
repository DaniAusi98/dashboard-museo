import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../lib/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // RECUPERAR SESIÓN AL INICIAR LA APP
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          authService.logout();
          setUser(null);
          return;
        }

        const user = await authService.getCurrentUser();
        setUser(user);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const result = await authService.login(email, password);

    setUser(result.user);

    return result;
  };

  // REGISTER
  const register = async (userData) => {
    await authService.register(userData);
  };

  // LOGOUT
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return ctx;
}
