import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../api';

/* ---- Inline SVG Icons ---- */
const TicketsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const TrendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

const priorityColors = { low: 'green', medium: 'amber', high: 'orange', critical: 'red' };
const categoryColors = { billing: 'blue', technical: 'purple', account: 'green', general: 'slate' };
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const categoryLabels = { billing: 'Billing', technical: 'Technical', account: 'Account', general: 'General' };

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
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <h3>No data yet</h3>
          <p>Create your first ticket to see analytics here</p>
        </div>
      </div>
    );
  }

  const maxPriority = Math.max(...Object.values(stats.priority_breakdown || {}), 1);
  const maxCategory = Math.max(...Object.values(stats.category_breakdown || {}), 1);

  return (
    <div>
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <TicketsIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total_tickets}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <AlertCircleIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.open_tickets}</div>
            <div className="stat-label">Open Tickets</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.avg_tickets_per_day}</div>
            <div className="stat-label">Avg / Day</div>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="breakdown-grid">
        <div className="breakdown">
          <div className="breakdown-title">Priority Distribution</div>
          {Object.entries(stats.priority_breakdown || {}).map(([priority, count]) => (
            <div key={priority} className="breakdown-item">
              <span className="breakdown-label">
                <span className={`badge badge-${priority}`}>
                  <span className="badge-dot" />
                  {priorityLabels[priority] || priority}
                </span>
              </span>
              <div className="breakdown-bar">
                <div
                  className={`breakdown-bar-fill ${priorityColors[priority] || 'blue'}`}
                  style={{ width: `${(count / maxPriority) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">{count}</span>
            </div>
          ))}
        </div>

        <div className="breakdown">
          <div className="breakdown-title">Category Distribution</div>
          {Object.entries(stats.category_breakdown || {}).map(([category, count]) => (
            <div key={category} className="breakdown-item">
              <span className="breakdown-label">
                <span className={`badge badge-${category}`}>
                  <span className="badge-dot" />
                  {categoryLabels[category] || category}
                </span>
              </span>
              <div className="breakdown-bar">
                <div
                  className={`breakdown-bar-fill ${categoryColors[category] || 'blue'}`}
                  style={{ width: `${(count / maxCategory) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="alert alert-info">
        <InfoIcon />
        Dashboard auto-refreshes every 30 seconds. Statistics use database-level aggregation for optimal performance.
      </div>
    </div>
  );
};

export default StatsDashboard;
