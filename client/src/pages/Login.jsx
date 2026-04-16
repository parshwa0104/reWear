import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('test@rewear.com');
  const [password, setPassword] = useState('test@123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      const apiError = err.response?.data?.error;
      const networkError = !err.response;
      setError(apiError || (networkError ? 'Cannot reach server. Please make sure backend is running on localhost:5000.' : 'Login failed'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-up">
        <p className="auth-chip">WELCOME BACK</p>
        <h2 className="heading-lg mb-sm">Sign in to your ReWear account</h2>
        <p className="text-secondary mb-xl">Ethnic elegance, rented smarter.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md auth-form">
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

          <button type="submit" className="btn btn-green btn-full btn-lg mt-md">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-xl auth-footnote">
          Don't have an account? <Link to="/register" className="text-purple ml-1">Create one</Link>
        </p>

        <p className="demo-hint">Test login prefilled: <strong>test@rewear.com</strong> / <strong>test@123</strong></p>
      </div>
    </div>
  );
}
