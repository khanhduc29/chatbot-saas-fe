import { useState, useEffect } from 'react';
import { botApi } from '../api/client';
import BotCard from '../components/BotCard';
import BotForm from '../components/BotForm';

export default function Dashboard() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const res = await botApi.getAll();
      setBots(res.data.data);
    } catch (err) {
      console.error('Failed to load bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await botApi.create(data);
      setShowForm(false);
      loadBots();
      // Notify sidebar to update
      window.dispatchEvent(new Event('bots-updated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create bot');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the bot and all its data.')) return;
    try {
      await botApi.delete(id);
      loadBots();
      window.dispatchEvent(new Event('bots-updated'));
    } catch (err) {
      alert('Failed to delete bot');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage your AI chatbots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Create Bot
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{bots.length}</div>
          <div className="stat-label">Total Bots</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {bots.reduce((acc, b) => acc + (b.stats?.documents || 0), 0)}
          </div>
          <div className="stat-label">Total Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {bots.reduce((acc, b) => acc + (b.stats?.messages || 0), 0)}
          </div>
          <div className="stat-label">Total Messages</div>
        </div>
      </div>

      {/* Bot Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : bots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>No bots yet</h3>
          <p>Create your first AI chatbot to get started</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Create Your First Bot
          </button>
        </div>
      ) : (
        <div className="bots-grid">
          {bots.map(bot => (
            <BotCard
              key={bot._id}
              bot={bot}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Bot Modal */}
      {showForm && (
        <BotForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
