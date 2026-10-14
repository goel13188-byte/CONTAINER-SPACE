import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Use our new api service
import AuthContext from '../state/AuthContext'; // Import the context

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/users/login', { email, password }, { timeout: 90000 });

      // Call context login function
      login(data, data.token);

      setMessage('Login successful!');
      navigate('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      setMessage(error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The server is taking longer than expected. Please try again shortly.' : 'Unable to connect to the server. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page login-page"><div className="auth-visual"><span className="eyebrow">SHIPSPACE IDENTITY</span><h2>Your shipping network, connected.</h2><p>One workspace for container capacity, bookings and business conversations.</p><div className="auth-visual-stats"><span><strong>01</strong> Find space</span><span><strong>02</strong> Connect</span><span><strong>03</strong> Ship smarter</span></div></div><div className="auth-card glass-panel">
      <span className="eyebrow">WELCOME BACK</span><h1>Login to Your Account</h1>
      {message && <p className="message-error">{message}</p>}
      <form onSubmit={submitHandler}>
        <div>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Waking server / Signing in…' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        New user? <Link to="/register">Register here</Link>
      </p>
    </div></section>
  );
};

export default LoginPage;