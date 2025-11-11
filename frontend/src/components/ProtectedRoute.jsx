import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../state/AuthContext';

const ProtectedRoute = () => {
  const { token } = useContext(AuthContext);

  // Check if user is logged in (has a token)
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;