import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const token = localStorage.getItem('authTokens');
    return token ? JSON.parse(token) : null;
  });

  const loginUser = async (username, password) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/token/`, { username, password });
      console.log("Login response:", response.data);  // Debugging statement
      setAuthTokens(response.data);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error logging in: ', error);
    }
  };

  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    localStorage.removeItem('authTokens');
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshToken = authTokens?.refresh;
    if (!refreshToken) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, { refresh: refreshToken });
      setAuthTokens(response.data);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing token: ', error);
    }
  }, [authTokens]);

  useEffect(() => {
    if (authTokens) {
      const decoded = jwtDecode(authTokens.access);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        refreshToken();
      }
    }
  }, [authTokens, refreshToken]);

  return (
    <AuthContext.Provider value={{ authTokens, loginUser, logoutUser, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
