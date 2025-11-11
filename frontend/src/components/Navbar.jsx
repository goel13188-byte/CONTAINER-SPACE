import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../state/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12 18.75c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125-1.125.504-1.125 1.125.504 1.125 1.125 1.125zM12 7.5c-1.24 0-2.25.75-2.25 1.5v4.5c0 .75 1.01 1.5 2.25 1.5s2.25-.75 2.25-1.5v-4.5c0-.75-1.01-1.5-2.25-1.5z" />
        </svg>
        ShipSpace
      </Link>
      <div className="navbar-links">
        <Link to="/find-space">Find Space</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/pricing">Pricing</Link> {/* --- Add this line --- */}

        {user ? (
          <>
            <Link to="/dashboard">Home</Link>
            <a href="#!" onClick={onLogout}>
              Logout
            </a>
            <Link to="/create-listing" className="btn-nav-register">
              List Your Space
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-nav-register">
              Register
            </Link> {/* --- This was </DASH> --- */}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;