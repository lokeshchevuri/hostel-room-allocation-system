import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hostel_admin_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            setAdmin(data.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Token verification error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = (adminData, userToken) => {
    setAdmin(adminData);
    setToken(userToken);
    localStorage.setItem('hostel_admin_token', userToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken('');
    localStorage.removeItem('hostel_admin_token');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
