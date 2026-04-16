import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, RefreshCw, Globe2 } from 'lucide-react';
import './Onboarding.css';

const slides = [
  {
    id: 1,
    title: "Got clothes you don't wear?",
    desc: "Your closet is full, but you have nothing to wear. We've all been there.",
    icon: <Sparkles className="slide-icon text-purple" />
  },
  {
    id: 2,
    title: "Rent outfits. Earn money.",
    desc: "List your premium clothes. Rent stunning outfits for a fraction of the cost.",
    icon: <RefreshCw className="slide-icon text-green" />
  },
  {
    id: 3,
    title: "Fashion without waste",
    desc: "Join the circular fashion movement. Look good while healing the planet. 🌍",
    icon: <Globe2 className="slide-icon text-green" />
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('rewear_onboarded', 'true');
    navigate('/register');
  };

  return (
    <div className="onboarding-container app-frame">
      <div className="onboarding-top-tag">A BETTER WAY TO WEAR</div>
      <div className="slides-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="slide">
            <div className="slide-icon-container animate-float">
              {slide.icon}
            </div>
            <h2 className="heading-lg mt-xl mb-md animate-fade-in-up">{slide.title}</h2>
            <p className="body-lg text-secondary text-center px-md animate-fade-in-up delay-100">
              {slide.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="onboarding-controls">
        <div className="dots flex gap-sm mb-xl justify-center">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>

        <button className="btn btn-green btn-full btn-lg" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>

        <button className="btn btn-ghost btn-full mt-sm" onClick={finishOnboarding}>
          Skip
        </button>
      </div>
    </div>
  );
}
