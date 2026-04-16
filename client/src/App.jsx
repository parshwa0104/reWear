import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import UploadOutfit from './pages/UploadOutfit';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import AIPreview from './pages/AIPreview';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="app-frame">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/outfit/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadOutfit /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:outfitId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        
        {/* Bonus Feature */}
        <Route path="/preview" element={<ProtectedRoute><AIPreview /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
