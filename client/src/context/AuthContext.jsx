import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("tripnest_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("tripnest_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function applySession(data) {
    localStorage.setItem("tripnest_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function signup(name, email, password) {
    const res = await api.post("/auth/signup", { name, email, password });
    applySession(res.data);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    applySession(res.data);
  }

  function logout() {
    localStorage.removeItem("tripnest_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
