import React, { useState, useCallback } from 'react';
import { ticketAPI } from '../api';

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
    <path d="m21.854 2.147-10.94 10.939"/>
  </svg>
);

const categoryLabels = { billing: 'Billing', technical: 'Technical', account: 'Account', general: 'General' };
const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

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
  const [classifyTimeoutId, setClassifyTimeoutId] = useState(null);
  const [aiSuggested, setAiSuggested] = useState(false);

  const classifyDescription = useCallback(async (description) => {
    if (description.length < 10) return;

    setLoadingClassify(true);
    try {
      const response = await ticketAPI.classify(description);
      setFormData(prev => ({
        ...prev,
        category: response.data.suggested_category || 'general',
        priority: response.data.suggested_priority || 'medium',
      }));
      setAiSuggested(true);
    } catch (error) {
      console.error('LLM classification failed:', error);
    } finally {
      setLoadingClassify(false);
    }
  }, []);

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    setFormData(prev => ({ ...prev, description }));
    setAiSuggested(false);

    if (classifyTimeoutId) {
      clearTimeout(classifyTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      classifyDescription(description);
    }, 800);

    setClassifyTimeoutId(timeoutId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await ticketAPI.create(formData);
      setMessage({ type: 'success', text: 'Ticket created successfully!' });
      setFormData({ title: '', description: '', category: 'general', priority: 'medium' });
      setAiSuggested(false);
      onTicketCreated(response.data);
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to create ticket. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>New Support Request</h2>
            <p className="card-subtitle">Fill in the details below. Our AI will help categorize your ticket.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              maxLength="200"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Brief summary of your issue"
            />
            <div className="form-hint">
              {formData.title.length}/200 characters
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              placeholder="Describe your issue in detail. Our AI will auto-suggest a category and priority based on your description..."
              rows={6}
            />
            {loadingClassify && (
              <div className="ai-panel loading">
                <SparkleIcon />
                <span className="ai-panel-text">AI is analyzing your description...</span>
              </div>
            )}
            {aiSuggested && !loadingClassify && (
              <div className="ai-panel">
                <SparkleIcon />
                <span className="ai-panel-text">
                  AI suggests: <strong>{categoryLabels[formData.category]}</strong> category, <strong>{priorityLabels[formData.priority]}</strong> priority
                </span>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category
                {aiSuggested && <span style={{ color: 'var(--color-primary)', fontSize: 11, marginLeft: 6, fontWeight: 400 }}>AI suggested</span>}
              </label>
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
              <label className="form-label" htmlFor="priority">
                Priority
                {aiSuggested && <span style={{ color: 'var(--color-primary)', fontSize: 11, marginLeft: 6, fontWeight: 400 }}>AI suggested</span>}
              </label>
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
            className="btn btn-primary btn-lg btn-full"
            disabled={submitting || !formData.title || !formData.description}
            style={{ marginTop: 8 }}
          >
            {submitting ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon />
                Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicketForm;
