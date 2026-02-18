import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../api';

const StatsDashboard = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <p>No statistics available yet. Create your first ticket to get started!</p>
      </div>
    );
  }

  const maxPriority = Math.max(...Object.values(stats.priority_breakdown), 1);
  const maxCategory = Math.max(...Object.values(stats.category_breakdown), 1);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_tickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.open_tickets}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avg_tickets_per_day}</div>
          <div className="stat-label">Avg Tickets/Day</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="breakdown">
          <div className="breakdown-title">Priority Breakdown</div>
          {Object.entries(stats.priority_breakdown).map(([priority, count]) => (
            <div key={priority} className="breakdown-item">
              <span style={{ minWidth: '80px' }}>
                <span className={`badge badge-${priority}`} style={{ marginRight: '0.5rem' }}>
                  {priority}
                </span>
              </span>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-bar-fill"
                  style={{ width: `${(count / maxPriority) * 100}%` }}
                />
              </div>
              <span style={{ minWidth: '50px', textAlign: 'right', fontWeight: 600 }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        <div className="breakdown">
          <div className="breakdown-title">Category Breakdown</div>
          {Object.entries(stats.category_breakdown).map(([category, count]) => (
            <div key={category} className="breakdown-item">
              <span style={{ minWidth: '80px' }}>
                <span className={`badge badge-${category}`} style={{ marginRight: '0.5rem' }}>
                  {category}
                </span>
              </span>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-bar-fill"
                  style={{ width: `${(count / maxCategory) * 100}%` }}
                />
              </div>
              <span style={{ minWidth: '50px', textAlign: 'right', fontWeight: 600 }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p>💡 Dashboard auto-refreshes every 30 seconds. Statistics use database-level aggregation for optimal performance.</p>
      </div>
    </div>
  );
};

export default StatsDashboard;
