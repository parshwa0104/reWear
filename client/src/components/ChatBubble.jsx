import './ChatBubble.css';

export default function ChatBubble({ message, isOwn }) {
  const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`chat-bubble-wrapper ${isOwn ? 'own' : 'other'} animate-slide-up`}>
      <div className="chat-bubble">
        <p className="chat-text">{message.text}</p>
        <span className="chat-time">{time}</span>
      </div>
    </div>
  );
}
