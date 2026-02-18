import React, { useState } from 'react';
import SubmitTicketForm from './components/SubmitTicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div>
      <nav>
        <h1>🎟️ Support Ticket System</h1>
      </nav>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Ticket
          </button>
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Browse Tickets
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>

        {activeTab === 'submit' && <SubmitTicketForm onTicketCreated={handleTicketCreated} />}
        {activeTab === 'list' && <TicketList refreshTrigger={refreshTrigger} />}
        {activeTab === 'stats' && <StatsDashboard refreshTrigger={refreshTrigger} />}
      </div>
    </div>
  );
}

export default App;
