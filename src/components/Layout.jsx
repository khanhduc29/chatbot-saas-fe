import { useState } from 'react';
import Sidebar from './Sidebar';
import { HiOutlineBars3 } from 'react-icons/hi2';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile header with hamburger */}
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
          <HiOutlineBars3 />
        </button>
        <h2 className="mobile-logo">🤖 ChatBot SaaS</h2>
      </header>

      {/* Overlay khi sidebar mở trên mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
