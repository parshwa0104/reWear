import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check auth status here in a real app, for now go to onboarding
      const hasSeenOnboarding = localStorage.getItem('rewear_onboarded');
      const token = localStorage.getItem('rewear_token');
      
      if (token) {
        navigate('/home', { replace: true });
      } else if (hasSeenOnboarding) {
        navigate('/login', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content animate-scale-in">
        <div className="logo-container">
          <Leaf className="logo-icon animate-float text-green" />
        </div>
        <h1 className="heading-xl mt-4">ReWear</h1>
        <p className="tagline body-md text-muted animate-fade-in delay-500 mt-2">
          Wear More. Waste Less.
        </p>
      </div>
      <div className="background-glow animate-pulse"></div>
    </div>
  );
}
