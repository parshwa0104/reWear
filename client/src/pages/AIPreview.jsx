import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import './AIPreview.css';

export default function AIPreview() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const handleUpload = (e) => {
    // In demo, just pretend we uploaded and simulate processing
    setPhoto(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPreviewReady(true);
    }, 3000);
  };

  return (
    <div className="page pb-24">
      {/* Header Nav */}
      <div className="flex items-center p-md bg-transparent">
        <button className="nav-circle-btn z-10" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="px-md">
        <div className="text-center mb-xl animate-fade-in-down">
          <div className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-purple/10 text-purple text-xs font-bold mb-sm border border-purple/20">
            <Sparkles className="w-3 h-3" />
            Powered by ReWear AI
          </div>
          <h1 className="heading-md mb-2">Virtual Fitting Room</h1>
          <p className="text-sm text-secondary px-lg">See how this outfit looks on you before renting.</p>
        </div>

        {!photo ? (
          <div className="upload-box glass text-center p-xl rounded-xl border border-subtle flex flex-col items-center justify-center h-80 animate-scale-in delay-100" onClick={handleUpload}>
            <div className="w-16 h-16 bg-purple/20 rounded-full flex items-center justify-center mb-md text-purple m-auto shadow-purple">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="font-semibold body-md">Upload full body photo</h3>
            <p className="text-xs text-muted mt-2">JPEG/PNG formats</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-80 bg-card rounded-xl border border-subtle animate-pulse">
            <Sparkles className="w-10 h-10 text-purple mb-4 animate-spin" />
            <p className="text-sm text-purple font-semibold animate-glow">Stitching virtual threads...</p>
          </div>
        ) : (
          <div className="preview-result animate-fade-in relative rounded-xl overflow-hidden border border-purple/40 shadow-[0_0_20px_rgba(179,136,255,0.2)] h-[400px]">
            {/* Fake output image area */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=600" 
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
              alt="AI Result" 
            />
            <div className="absolute bottom-md left-md right-md z-20 flex gap-sm">
              <button className="flex-1 btn btn-outline btn-sm bg-card/80 backdrop-blur" onClick={() => {setPhoto(false); setPreviewReady(false)}}>
                Try Another
              </button>
              <button className="flex-[2] btn btn-purple flex items-center justify-center" onClick={() => navigate(-1)}>
                Looks Great!
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!previewReady && <Navbar />}
    </div>
  );
}
