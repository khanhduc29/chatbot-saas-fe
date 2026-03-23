import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { botApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HiOutlineHome, HiOutlineArrowRightOnRectangle, HiOutlineUserGroup, HiOutlineXMark } from 'react-icons/hi2';

export default function Sidebar({ isOpen, onClose }) {
  const [bots, setBots] = useState([]);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const typeEmoji = { sales: '💰', support: '🛟', content: '✍️' };

  useEffect(() => {
    loadBots();
    const handler = () => loadBots();
    window.addEventListener('bot-updated', handler);
    return () => window.removeEventListener('bot-updated', handler);
  }, []);

  // Auto-close sidebar on mobile khi navigate
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const loadBots = async () => {
    try {
      const res = await botApi.getAll();
      setBots(res.data.data);
    } catch (err) {
      console.error('Failed to load bots:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-logo">🤖 ChatBot SaaS</h2>
        <button className="sidebar-close-btn" onClick={onClose}>
          <HiOutlineXMark />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HiOutlineHome /> Dashboard
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <HiOutlineUserGroup /> Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-section-title">MY BOTS</div>
        {bots.map(bot => (
          <NavLink
            key={bot._id}
            to={`/bots/${bot._id}`}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span>{typeEmoji[bot.type] || '🤖'}</span>
            <span className="nav-link-text">{bot.name}</span>
          </NavLink>
        ))}
      </div>

      {/* User info at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.role === 'admin' ? '👑' : '👤'}
          </div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">
              <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Đăng xuất">
          <HiOutlineArrowRightOnRectangle />
        </button>
      </div>
    </aside>
  );
}
