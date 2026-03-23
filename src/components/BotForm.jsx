import { useState, useEffect } from 'react';

export default function BotForm({ bot, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'support',
    systemPrompt: ''
  });

  useEffect(() => {
    if (bot) {
      setForm({
        name: bot.name || '',
        description: bot.description || '',
        type: bot.type || 'support',
        systemPrompt: bot.systemPrompt || ''
      });
    }
  }, [bot]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          {bot ? '✏️ Edit Bot' : '🤖 Create New Bot'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bot Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sales Assistant"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              className="form-input"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of your bot"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bot Type *</label>
            <select
              name="type"
              className="form-select"
              value={form.type}
              onChange={handleChange}
            >
              <option value="sales">💰 Sales - Chốt sale, gợi ý sản phẩm</option>
              <option value="support">🛟 Support - Hỗ trợ khách hàng</option>
              <option value="content">✍️ Content - Viết nội dung sáng tạo</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Custom System Prompt
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional - leave empty for default)</span>
            </label>
            <textarea
              name="systemPrompt"
              className="form-textarea"
              value={form.systemPrompt}
              onChange={handleChange}
              placeholder="Custom instructions for bot behavior..."
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {bot ? 'Update Bot' : 'Create Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
