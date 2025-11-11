import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Use our new api service
import AuthContext from '../state/AuthContext'; // Import the context

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/login', { email, password });

      // Call context login function
      login(data, data.token);

      setMessage('Login successful!');
      navigate('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div>
      <h1>Login to Your Account</h1>
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
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;