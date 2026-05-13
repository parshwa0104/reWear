import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Invalid OTP. Please enter 123456.');
      return;
    }
    
    try {
      await register(name, email, 'demo123', 'Mumbai, India');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-up">
        <p className="auth-chip">JOIN CLOSET COLLECTIVE</p>
        <h2 className="heading-lg mb-sm">Create your account</h2>
        <p className="text-secondary mb-xl">Start renting quality looks without closet clutter.</p>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-md auth-form">
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
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="input" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                maxLength="10"
                placeholder="10 digit number"
                required 
              />
            </div>

            <button type="submit" className="btn btn-purple btn-full btn-lg mt-md">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-md auth-form">
            <p className="text-sm text-secondary mb-2">We've sent an OTP to {phone}</p>
            <div className="input-group">
              <label>Enter OTP</label>
              <input 
                type="text" 
                className="input text-center text-lg tracking-widest" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                maxLength="6"
                placeholder="123456"
                required 
              />
            </div>

            <button type="submit" className="btn btn-purple btn-full btn-lg mt-md">
              Verify & Sign Up
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-full mt-sm"
              onClick={() => { setStep(1); setError(''); setOtp(''); }}
            >
              Back
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-secondary mt-xl auth-footnote">
            Already have an account? <Link to="/login" className="text-green ml-1">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
