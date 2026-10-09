import React,{useContext} from 'react';
import {NavLink,Link,useNavigate} from 'react-router-dom';
import AuthContext from '../state/AuthContext';
import NotificationBell from './NotificationBell';
const Navbar=()=>{
 const {user,logout}=useContext(AuthContext);const navigate=useNavigate();
 const onLogout=()=>{logout();navigate('/login');};
 const linkClass=({isActive})=>isActive?'nav-link is-active':'nav-link';
 return <nav className="navbar">
  <Link to="/" className="navbar-logo" aria-label="ShipSpace home"><span className="brand-mark">◆</span><span>Ship<span>Space</span></span></Link>
  <div className="navbar-links">
   <NavLink to="/find-space" className={linkClass}>Find Space</NavLink>
   <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
   <NavLink to="/pricing" className={linkClass}>Pricing</NavLink>
   {user?<><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink><NotificationBell />{user.role==='admin'&&<NavLink to="/admin" className={linkClass}>Admin</NavLink>}<button type="button" className="nav-logout" onClick={onLogout}>Logout</button><Link to="/create-listing" className="btn-nav-register">＋ List Your Space</Link></>:<><NavLink to="/login" className={linkClass}>Login</NavLink><NavLink to="/register" className="btn-nav-register">Get Started ↗</NavLink></>}
  </div>
 </nav>;
};
export default Navbar;