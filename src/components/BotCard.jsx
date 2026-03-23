import { Link } from 'react-router-dom';
import { HiOutlineDocumentText, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

export default function BotCard({ bot, onEdit, onDelete }) {
  const typeEmoji = { sales: '💰', support: '🛟', content: '✍️' };

  return (
    <div className="card bot-card" data-type={bot.type}>
      <div className="bot-card-header">
        <div className="bot-card-info">
          <h3>{typeEmoji[bot.type]} {bot.name}</h3>
          <p>{bot.description || 'No description'}</p>
        </div>
        <span className={`bot-type-badge ${bot.type}`}>
          {bot.type}
        </span>
      </div>

      <div className="bot-card-stats">
        <div className="bot-stat">
          <HiOutlineDocumentText className="stat-icon" />
          {bot.stats?.documents || 0} documents
        </div>
        <div className="bot-stat">
          <HiOutlineChatBubbleLeftRight className="stat-icon" />
          {bot.stats?.messages || 0} messages
        </div>
      </div>

      <div className="bot-card-actions">
        <Link to={`/bots/${bot._id}`} className="btn btn-secondary btn-sm" style={{ textAlign: 'center' }}>
          ⚙️ Manage
        </Link>
        <Link to={`/bots/${bot._id}/chat`} className="btn btn-primary btn-sm" style={{ textAlign: 'center' }}>
          💬 Chat
        </Link>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(bot._id)}>
          🗑️
        </button>
      </div>
    </div>
  );
}
