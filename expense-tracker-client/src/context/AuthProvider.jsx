import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  getMeRequest,
  loginRequest,
  registerRequest,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = async () => {
    try {
      const data = await getMeRequest();
      setUser(data);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    const data = await loginRequest(formData);
    localStorage.setItem("token", data.token);
    await loadUser();
  };

  const register = async (formData) => {
    const data = await registerRequest(formData);
    localStorage.setItem("token", data.token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}