import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-container ${isVisible ? 'show' : 'hide'}`}>
      <div className={`toast toast-${type}`}>
        {type === 'success' ? <CheckCircle className="toast-icon" /> : <XCircle className="toast-icon" />}
        <span>{message}</span>
      </div>
    </div>
  );
}
