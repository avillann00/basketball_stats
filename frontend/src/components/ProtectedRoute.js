import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const { authTokens, refreshToken } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authTokens) {
        setIsAuthorized(false);
        return;
      }

      const decoded = jwtDecode(authTokens.access);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth().catch(() => setIsAuthorized(false));
  }, [authTokens, refreshToken]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
