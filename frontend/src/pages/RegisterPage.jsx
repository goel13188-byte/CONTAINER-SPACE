import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Use our new api service

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        '/users/register',
        { name, email, password, companyName },
      );

      console.log(data);
      setMessage('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'An error occurred during registration'
      );
    }
  };

  return (
    <section className="auth-page register-page"><div className="auth-visual"><span className="eyebrow">JOIN THE NETWORK</span><h2>Make every cubic metre count.</h2><p>Connect with shipping partners and turn available container space into new opportunities.</p><div className="auth-visual-stats"><span><strong>01</strong> Create profile</span><span><strong>02</strong> Publish space</span><span><strong>03</strong> Grow network</span></div></div><div className="auth-card glass-panel">
      <span className="eyebrow">GET STARTED</span><h1>Create Your Account</h1>
      {message && <p className={message.includes('successful') ? "message-success" : "message-error"}>{message}</p>}
      <form onSubmit={submitHandler}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
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
          Register
        </button>
      </form>
       <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div></section>
  );
};

export default RegisterPage;