import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../api/client';
import ChatMessage from './ChatMessage';
import { HiPaperAirplane } from 'react-icons/hi2';

export default function ChatWindow({ botId, botName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await chatApi.getMessages(botId);
        setMessages(res.data.data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [botId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Optimistic update - thêm user message ngay
    setMessages(prev => [...prev, {
      _id: Date.now(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      const res = await chatApi.sendMessage(botId, userMessage);

      // Thêm bot response
      setMessages(prev => [...prev, {
        _id: Date.now() + 1,
        role: 'assistant',
        content: res.data.data.message,
        createdAt: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        _id: Date.now() + 1,
        role: 'assistant',
        content: '❌ Error: Failed to get response. Please try again.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear all chat history?')) return;
    try {
      await chatApi.clearMessages(botId);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear messages:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>💬 Chat with {botName}</h2>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleClearHistory}>
          🗑️ Clear History
        </button>
      </div>

      <div className="chat-messages">
        {loadingHistory ? (
          <div className="empty-state">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p style={{ marginTop: '12px' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Send a message to begin chatting with {botName}</p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage key={msg._id} message={msg} />
          ))
        )}

        {loading && (
          <div className="chat-message assistant">
            <div className="chat-message-avatar">🤖</div>
            <div className="chat-message-content">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <HiPaperAirplane />
          </button>
        </div>
      </div>
    </div>
  );
}
