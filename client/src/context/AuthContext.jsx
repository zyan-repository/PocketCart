import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchAPI } from "../services/api.js";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const data = await fetchAPI("/api/auth/user");
      setUser(data.user);
    } catch (error) {
      if (error.status === 401 || error.message.includes("401") || error.message.includes("Not authenticated")) {
        setUser(null);
      } else {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const data = await fetchAPI("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function register(email, password, name) {
    try {
      const data = await fetchAPI("/api/auth/register", {
        method: "POST",
        body: { email, password, name },
      });

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function logout() {
    try {
      await fetchAPI("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
