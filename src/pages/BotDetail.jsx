import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { botApi } from '../api/client';
import BotForm from '../components/BotForm';
import KnowledgeUpload from '../components/KnowledgeUpload';

export default function BotDetail() {
  const { id } = useParams();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadBot();
  }, [id]);

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

  const handleUpdate = async (data) => {
    try {
      await botApi.update(id, data);
      setEditing(false);
      loadBot();
      window.dispatchEvent(new Event('bots-updated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update bot');
    }
  };

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

  const typeEmoji = { sales: '💰', support: '🛟', content: '✍️' };
  const typeLabel = { sales: 'Sales Bot', support: 'Support Bot', content: 'Content Bot' };

  return (
    <div>
      {/* Header */}
      <div className="bot-detail-header">
        <div className={`bot-detail-icon ${bot.type}`}>
          {typeEmoji[bot.type]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{bot.name}</h1>
          <p className="page-subtitle">
            {typeLabel[bot.type]} • {bot.stats?.documents || 0} documents • {bot.stats?.messages || 0} messages
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>
            ✏️ Edit
          </button>
          <Link to={`/bots/${id}/chat`} className="btn btn-primary">
            💬 Chat
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bot-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          Knowledge Base
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>📋 Description</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {bot.description || 'No description provided'}
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>🧠 System Prompt</h3>
            <pre style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6,
              background: 'var(--bg-primary)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {bot.systemPrompt || `(Using default ${bot.type} prompt)`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <KnowledgeUpload botId={id} />
      )}

      {/* Edit Modal */}
      {editing && (
        <BotForm
          bot={bot}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}
