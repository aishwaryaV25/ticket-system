import React, { useState } from 'react';
import SubmitTicketForm from './components/SubmitTicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

/* ---- Inline SVG Icons ---- */
const Icons = {
  ticket: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
    </svg>
  ),
  list: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
      <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  bell: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  menu: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  help: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
    </svg>
  ),
};

const pageTitles = {
  submit: { title: 'Create Ticket', subtitle: 'Submit a new support request' },
  list: { title: 'Browse Tickets', subtitle: 'View and manage all support tickets' },
  stats: { title: 'Analytics', subtitle: 'Ticket metrics and insights' },
};

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  const currentPage = pageTitles[activeTab];

  return (
    <div className="app-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {Icons.ticket}
          </div>
          <div className="sidebar-brand">
            TicketDesk
            <span>Support Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>

          <button
            className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => { setActiveTab('list'); setSidebarOpen(false); }}
          >
            {Icons.list}
            Browse Tickets
          </button>

          <button
            className={`nav-item ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('submit'); setSidebarOpen(false); }}
          >
            {Icons.plus}
            Create Ticket
          </button>

          <button
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => { setActiveTab('stats'); setSidebarOpen(false); }}
          >
            {Icons.chart}
            Analytics
          </button>

          <div className="sidebar-section-label">System</div>

          <button className="nav-item" style={{ opacity: 0.4, cursor: 'default' }}>
            {Icons.settings}
            Settings
          </button>

          <button className="nav-item" style={{ opacity: 0.4, cursor: 'default' }}>
            {Icons.help}
            Help Center
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">TI</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Tech Intern</div>
              <div className="sidebar-user-role">Support Agent</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {Icons.menu}
            </button>
            <div className="topbar-title">
              <h1>{currentPage.title}</h1>
              <p>{currentPage.subtitle}</p>
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Search">
              {Icons.search}
            </button>
            <button className="topbar-icon-btn" aria-label="Notifications">
              {Icons.bell}
              <span className="notification-dot" />
            </button>
            <div className="sidebar-avatar" style={{ width: 34, height: 34, fontSize: 12, cursor: 'pointer' }}>TI</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {activeTab === 'submit' && <SubmitTicketForm onTicketCreated={handleTicketCreated} />}
          {activeTab === 'list' && <TicketList refreshTrigger={refreshTrigger} />}
          {activeTab === 'stats' && <StatsDashboard refreshTrigger={refreshTrigger} />}
        </main>
      </div>
    </div>
  );
}

export default App;
