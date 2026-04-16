import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, 'Mumbai, India');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-up">
        <p className="auth-chip">JOIN REWEAR</p>
        <h2 className="heading-lg mb-sm">Create your account</h2>
        <p className="text-secondary mb-xl">Start renting quality looks without closet clutter.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-purple btn-full btn-lg mt-md">
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-xl auth-footnote">
          Already have an account? <Link to="/login" className="text-green ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
