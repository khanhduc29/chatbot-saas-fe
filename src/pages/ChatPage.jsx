import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { botApi } from '../api/client';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
  const { id } = useParams();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBot = async () => {
      try {
        const res = await botApi.getById(id);
        setBot(res.data.data);
      } catch (err) {
        console.error('Failed to load bot:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBot();
  }, [id]);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Bot not found</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <ChatWindow botId={id} botName={bot.name} />;
}
