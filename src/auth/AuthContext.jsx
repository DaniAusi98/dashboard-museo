import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../lib/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      const loggedUser = await authService.getCurrentUser();

      setUser(loggedUser);
      setLoading(false);
    };

    loadUser();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const result = await authService.login(email, password);

    setUser(result.user);
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return ctx;
}
