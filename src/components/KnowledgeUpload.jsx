import { useState, useEffect } from 'react';
import { knowledgeApi } from '../api/client';
import { HiOutlineDocumentText, HiOutlineTrash, HiOutlineEye, HiOutlineArrowDownTray } from 'react-icons/hi2';

export default function KnowledgeUpload({ botId }) {
  const [documents, setDocuments] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(null); // Document đang preview
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [botId]);

  const loadDocuments = async () => {
    try {
      const res = await knowledgeApi.getAll(botId);
      setDocuments(res.data.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleTextUpload = async () => {
    if (!text.trim()) return;
    setUploading(true);
    setStatus(null);

    try {
      const res = await knowledgeApi.upload(botId, text);
      setStatus({
        type: 'success',
        message: `✅ ${res.data.message}`
      });
      setText('');
      loadDocuments();
    } catch (err) {
      setStatus({
        type: 'error',
        message: `❌ ${err.response?.data?.error || 'Upload failed'}`
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      const res = await knowledgeApi.uploadPdf(botId, file);
      setStatus({
        type: 'success',
        message: `✅ ${res.data.message}`
      });
      loadDocuments();
    } catch (err) {
      setStatus({
        type: 'error',
        message: `❌ ${err.response?.data?.error || 'PDF upload failed'}`
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await knowledgeApi.delete(botId, docId);
      loadDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Preview document
  const handlePreview = async (docId) => {
    setLoadingPreview(true);
    try {
      const res = await knowledgeApi.getDetail(botId, docId);
      setPreview(res.data.data);
    } catch (err) {
      console.error('Failed to load document:', err);
      alert('Failed to load document preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Download document
  const handleDownload = (docId) => {
    const url = knowledgeApi.getDownloadUrl(botId, docId);
    window.open(url, '_blank');
  };

  return (
    <div className="knowledge-section">
      {status && (
        <div className={`status-bar ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* Text Upload */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>📝 Upload Text Knowledge</h3>
        <textarea
          className="form-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your knowledge text here... (product info, FAQs, guides, etc.)"
          rows={6}
          disabled={uploading}
        />
        <button
          className="btn btn-primary"
          onClick={handleTextUpload}
          disabled={!text.trim() || uploading}
          style={{ marginTop: '12px' }}
        >
          {uploading ? '⏳ Processing...' : '📤 Upload & Process'}
        </button>
      </div>

      {/* PDF Upload */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>📄 Upload PDF</h3>
        <label className="knowledge-upload-area" style={{ display: 'block' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📁</div>
          <p>{uploading ? 'Processing...' : 'Click to select PDF file (max 10MB)'}</p>
        </label>
      </div>

      {/* Document List */}
      <div className="card">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>
          📚 Knowledge Base ({documents.length} documents)
        </h3>

        {documents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            No documents uploaded yet. Add some knowledge for your bot to use!
          </p>
        ) : (
          <div className="knowledge-list">
            {documents.map(doc => (
              <div key={doc.id} className="knowledge-item">
                <div className="knowledge-item-info">
                  <HiOutlineDocumentText className="doc-icon" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                      {doc.source === 'pdf' ? doc.originalName : `Text Document`}
                    </div>
                    <div className="knowledge-item-meta">
                      {doc.chunksCount} chunks • {doc.source.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-icon"
                    onClick={() => handlePreview(doc.id)}
                    title="Preview content"
                  >
                    <HiOutlineEye />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDownload(doc.id)}
                    title="Download as text"
                  >
                    <HiOutlineArrowDownTray />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(doc.id)}
                    title="Delete document"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {(preview || loadingPreview) && (
        <div className="modal-overlay" onClick={() => !loadingPreview && setPreview(null)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '720px', maxHeight: '85vh' }}
          >
            {loadingPreview ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading preview...</p>
              </div>
            ) : preview && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 className="modal-title" style={{ marginBottom: 0 }}>
                    👁️ Document Preview
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(preview.id)}
                    >
                      📥 Download
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreview(null)}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* Document info */}
                <div style={{
                  display: 'flex', gap: '16px', marginBottom: '16px',
                  fontSize: '13px', color: 'var(--text-muted)'
                }}>
                  <span>📦 {preview.chunksCount} chunks</span>
                  <span>📝 {preview.source.toUpperCase()}</span>
                  <span>📅 {new Date(preview.createdAt).toLocaleString()}</span>
                </div>

                {/* Tab-like switcher */}
                <div className="bot-detail-tabs" style={{ marginBottom: '16px' }}>
                  <button
                    className={`tab-btn ${!preview._showChunks ? 'active' : ''}`}
                    onClick={() => setPreview({ ...preview, _showChunks: false })}
                  >
                    📄 Full Content
                  </button>
                  <button
                    className={`tab-btn ${preview._showChunks ? 'active' : ''}`}
                    onClick={() => setPreview({ ...preview, _showChunks: true })}
                  >
                    🧩 Chunks ({preview.chunksCount})
                  </button>
                </div>

                {/* Content */}
                <div style={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px'
                }}>
                  {!preview._showChunks ? (
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: 'var(--text-primary)',
                      margin: 0
                    }}>
                      {preview.content}
                    </pre>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {preview.chunks.map(chunk => (
                        <div key={chunk.index} style={{
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--accent-secondary)',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Chunk #{chunk.index}
                          </div>
                          <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '13px',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary)',
                            margin: 0
                          }}>
                            {chunk.text}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
