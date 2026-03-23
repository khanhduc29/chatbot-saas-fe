import { useState, useEffect } from 'react';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await authApi.getUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Đổi role thành "${newRole}"?`)) return;

    try {
      await authApi.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await authApi.toggleActive(userId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle user');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👑 Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quản lý người dùng hệ thống</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>
          👥 Users ({users.length})
        </h3>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Đăng nhập cuối</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={!u.isActive ? 'row-disabled' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="user-avatar">
                        {u.role === 'admin' ? '👑' : '👤'}
                      </span>
                      <span>{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span className="badge badge-accent">(Bạn)</span>
                      )}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? '✅ Active' : '🚫 Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u.id !== currentUser?.id && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleToggleRole(u.id, u.role)}
                          title="Toggle role"
                        >
                          🔄 Role
                        </button>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleToggleActive(u.id)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? '🔒 Khoá' : '🔓 Mở'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
