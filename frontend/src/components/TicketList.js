import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../api';

const TicketList = ({ refreshTrigger }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: '',
  });
  const [expandedId, setExpandedId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await ticketAPI.getAll(params);
      setTickets(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters, refreshTrigger]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketAPI.update(ticketId, { status: newStatus });
      setTickets(tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncate = (text, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const getBadgeClass = (type, value) => {
    return `badge badge-${value}`;
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Filters</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by title or description..."
              style={{ margin: 0 }}
            />
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#999', fontSize: '1.1rem' }}>No tickets found</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-item ${expandedId === ticket.id ? 'expanded' : ''}`}
              onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
            >
              <div style={{ cursor: 'pointer' }}>
                <div className="ticket-title">{ticket.title}</div>
                <div className="ticket-description">
                  {expandedId === ticket.id 
                    ? ticket.description 
                    : truncate(ticket.description)}
                </div>
              </div>

              <div className="ticket-meta">
                <span className={getBadgeClass('category', ticket.category)}>
                  {ticket.category}
                </span>
                <span className={getBadgeClass('priority', ticket.priority)}>
                  {ticket.priority}
                </span>
                <span className={getBadgeClass('status', ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: 'auto' }}>
                  {formatDate(ticket.created_at)}
                </span>
              </div>

              {expandedId === ticket.id && (
                <div className="ticket-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                  <select
                    onChange={(e) => {
                      handleStatusChange(ticket.id, e.target.value);
                      e.target.value = ticket.status;
                    }}
                    defaultValue={ticket.status}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-sm"
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
