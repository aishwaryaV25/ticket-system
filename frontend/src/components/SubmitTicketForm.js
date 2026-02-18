import React, { useState, useCallback } from 'react';
import { ticketAPI } from '../api';

const SubmitTicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const [loadingClassify, setLoadingClassify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const classifyDescription = useCallback(async (description) => {
    if (description.length < 10) return;

    setLoadingClassify(true);
    try {
      const response = await ticketAPI.classify(description);
      setFormData(prev => ({
        ...prev,
        category: response.data.suggested_category,
        priority: response.data.suggested_priority,
      }));
    } catch (error) {
      console.error('LLM classification failed:', error);
    } finally {
      setLoadingClassify(false);
    }
  }, []);

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    
    const timeoutId = setTimeout(() => {
      classifyDescription(description);
    }, 800);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await ticketAPI.create(formData);
      setMessage({ type: 'success', text: 'Ticket created successfully!' });
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
      });
      onTicketCreated(response.data);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to create ticket' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>Submit a New Ticket</h2>
      
      {message && (
        <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            maxLength="200"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Brief summary of your issue"
          />
          <small style={{ color: '#999' }}>
            {formData.title.length}/200
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            required
            placeholder="Describe your issue in detail. Our AI will auto-suggest a category and priority."
          />
          {loadingClassify && (
            <small style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              AI is analyzing your issue...
            </small>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="category">Category (AI suggested)</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority (AI suggested)</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={submitting || !formData.title || !formData.description}
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Submitting...
            </span>
          ) : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default SubmitTicketForm;
