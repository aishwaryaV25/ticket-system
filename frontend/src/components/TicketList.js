import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../api';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const ChevronIcon = ({ expanded }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const statusLabels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };
const categoryLabels = { billing: 'Billing', technical: 'Technical', account: 'Account', general: 'General' };
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncate = (text, length = 80) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
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
            <option value="">All Priorities</option>
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
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1 }}>
          <label>Search</label>
          <div className="search-input-wrapper">
            <SearchIcon />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search tickets..."
            />
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      {tickets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <InboxIcon />
            </div>
            <h3>No tickets found</h3>
            <p>Try adjusting your filters or create a new ticket</p>
          </div>
        </div>
      ) : (
        <div className="ticket-table-wrapper">
          <div className="ticket-table-header">
            <h2>All Tickets</h2>
            <span className="ticket-count">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
          </div>
          <table className="ticket-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <React.Fragment key={ticket.id}>
                  <tr
                    className={expandedId === ticket.id ? 'expanded' : ''}
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  >
                    <td><span className="ticket-id">#{ticket.id}</span></td>
                    <td><span className="ticket-title-cell">{ticket.title}</span></td>
                    <td><span className="ticket-desc-cell">{truncate(ticket.description)}</span></td>
                    <td>
                      <span className={`badge badge-${ticket.category}`}>
                        <span className="badge-dot" />
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${ticket.priority}`}>
                        <span className="badge-dot" />
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${ticket.status}`}>
                        <span className="badge-dot" />
                        {statusLabels[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td><span className="ticket-date">{formatDate(ticket.created_at)}</span></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      <ChevronIcon expanded={expandedId === ticket.id} />
                    </td>
                  </tr>
                  {expandedId === ticket.id && (
                    <tr className="ticket-expanded-row">
                      <td colSpan={8}>
                        <div className="ticket-detail-panel">
                          <div className="ticket-detail-desc">{ticket.description}</div>
                          <div className="ticket-detail-actions">
                            <label>Update Status:</label>
                            <select
                              value={ticket.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(ticket.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketList;
