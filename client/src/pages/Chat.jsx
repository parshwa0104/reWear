import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ChatBubble from '../components/ChatBubble';
import './Chat.css';

export default function Chat() {
  const { outfitId } = useParams(); // If outfitId is not present, we should ideally show a generic thread list. But for MVP, keeping it simple.
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const parseImages = (images) => {
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (!outfitId) {
      // In a full app, we'd fetch threads here.
      // For this prototype, if accessed from nav bar, just pretend no active chat
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const outRes = await api.get(`/outfits/${outfitId}`);
        setOutfit(outRes.data);
        
        // Find other user ID
        const otherId = outRes.data.owner?.id === user.id 
          ? outRes.data.renterId
          : outRes.data.owner?.id;

        const msgRes = await api.get(`/messages/conversation/${outfitId}/${otherId}`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [outfitId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !outfit) return;

    const tempMsg = {
      id: Date.now(),
      text: input,
      sender: { id: user.id },
      createdAt: new Date().toISOString()
    };
    setMessages([...messages, tempMsg]);
    setInput('');

    try {
      const otherId = outfit.owner?.id === user.id ? null : outfit.owner?.id;
      await api.post('/messages', {
        receiverId: otherId,
        outfitId: outfit.id,
        text: tempMsg.text
      });
    } catch (err) {
      console.error('Failed to send', err);
    }
  };

  if (!outfitId) {
    return (
      <div className="page pb-24 h-screen flex flex-col items-center justify-center text-center px-md">
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-md">
           <Send className="w-6 h-6 text-muted" />
        </div>
        <h2 className="heading-sm mb-sm text-secondary">No active conversations</h2>
        <p className="body-sm text-muted">Browse outfits and start a chat with an owner to arrange a rental.</p>
        <button className="btn btn-outline mt-lg" onClick={() => navigate('/home')}>Explore Outfits</button>
      </div>
    );
  }

  return (
    <div className="chat-page bg-primary min-h-screen flex flex-col relative h-[100dvh]">
      <Navbar />

      {/* Header */}
      <div className="chat-header border-b border-subtle bg-card sticky top-0 z-10">
        <div className="chat-header-inner">
          <button className="chat-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          {outfit && (
            <button className="chat-outfit-meta" onClick={() => navigate(`/outfit/${outfit.id}`)}>
              <img
                src={parseImages(outfit.images)[0] || 'https://via.placeholder.com/150?text=ReWear'}
                className="chat-outfit-thumb"
              />
              <div className="chat-outfit-text">
                <div className="chat-owner-name line-clamp-1">{outfit.owner?.name || 'Owner'}</div>
                <div className="chat-outfit-title line-clamp-1">{outfit.title}</div>
              </div>
            </button>
          )}
          {!outfit && <div className="chat-outfit-meta-spacer" />}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages flex-1 overflow-y-auto p-md pb-2 pt-lg bg-primary">
        {loading ? (
          <div className="flex justify-center"><div className="skeleton w-1/2 h-10 rounded-full mb-4"></div></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted py-xl border border-dashed border-subtle rounded-lg mt-md">
            Say hi to {outfit?.owner?.name || 'the owner'}! 👋<br/>
            <span className="text-xs">Ask about sizing, care, or pick-up details.</span>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender.id === user.id;
            return <ChatBubble key={msg.id || i} message={msg} isOwn={isOwn} />;
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="chat-input-area p-sm flex items-center gap-sm bg-card border-t border-subtle pb-safe">
        <div className="chat-input-inner">
          <button type="button" className="text-muted p-2 hover:text-purple transition-colors chat-media-btn">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="chat-message-input flex-1 bg-input border border-subtle rounded-full px-lg py-2 text-sm text-primary focus:border-purple outline-none focus:ring-1 focus:ring-purple-dim transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="chat-send-btn bg-purple text-primary rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
