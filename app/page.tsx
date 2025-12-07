'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Feedback {
  id: string;
  name: string;
  room_number: string;
  feedback: string;
  edit_token: string;
  created_at: string;
  updated_at: string;
}

interface EditTokens {
  [feedbackId: string]: string;
}

export default function ResidentPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [editTokens, setEditTokens] = useState<EditTokens>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editFeedbackText, setEditFeedbackText] = useState('');

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem('ay_theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ay_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Tokens
  useEffect(() => {
    const stored = localStorage.getItem('ay_feedback_tokens');
    if (stored) setEditTokens(JSON.parse(stored));
  }, []);

  const saveEditToken = useCallback((id: string, token: string) => {
    setEditTokens(prev => {
      const updated = { ...prev, [id]: token };
      localStorage.setItem('ay_feedback_tokens', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fetch feedbacks
  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch('/api/feedbacks', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setFeedbacks(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Auto-clear alerts
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(null); setError(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, room_number: roomNumber, feedback: feedbackText }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      saveEditToken(data.id, data.edit_token);
      setName(''); setRoomNumber(''); setFeedbackText('');
      setSuccess('Feedback submitted successfully!');
      fetchFeedbacks();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/feedbacks/${editingFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edit_token: editTokens[editingFeedback.id],
          name: editName,
          room_number: editRoomNumber,
          feedback: editFeedbackText,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess('Feedback updated!');
      setEditingFeedback(null);
      fetchFeedbacks();
    } catch {
      setError('Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edit_token: editTokens[id] }),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess('Feedback deleted!');
      setEditTokens(prev => {
        const updated = { ...prev };
        delete updated[id];
        localStorage.setItem('ay_feedback_tokens', JSON.stringify(updated));
        return updated;
      });
      fetchFeedbacks();
    } catch {
      setError('Failed to delete.');
    }
  };

  const canEdit = (f: Feedback) => editTokens[f.id] === f.edit_token;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const openEdit = (f: Feedback) => {
    setEditingFeedback(f);
    setEditName(f.name);
    setEditRoomNumber(f.room_number);
    setEditFeedbackText(f.feedback);
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo-link">
              <div className="logo">AY Residency</div>
            </Link>
            
            <div className="nav-container">
              <nav className="nav">
                <Link href="/" className="nav-link active">Feedback</Link>
                <Link href="/warden" className="nav-link">Warden</Link>
              </nav>
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            
            <button 
              className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
            </button>
          </div>
          
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <nav className="mobile-nav">
              <Link href="/" className="mobile-nav-link active" onClick={() => setMobileMenuOpen(false)}>
                Feedback
              </Link>
              <Link href="/warden" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Warden Panel
              </Link>
            </nav>
            <button className="mobile-theme-toggle" onClick={toggleTheme}>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="mobile-theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">
              <span className="hero-title-line">Your Voice</span>
              <span className="hero-title-line hero-title-outline">Matters</span>
            </h1>
            <p className="hero-subtitle">
              Share your thoughts, suggestions, or concerns. We&apos;re here to listen.
            </p>
          </div>

          {/* Alerts */}
          {error && <div className="alert alert-error"><span className="alert-icon">✕</span>{error}</div>}
          {success && <div className="alert alert-success"><span className="alert-icon">✓</span>{success}</div>}

          {/* Form */}
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Submit Feedback</h2>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input type="text" id="name" className="form-input" placeholder="Your name"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="room" className="form-label">Room Number</label>
                  <input type="text" id="room" className="form-input" placeholder="e.g., A-101"
                    value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="feedback" className="form-label">Your Feedback</label>
                <textarea id="feedback" className="form-textarea" placeholder="Share your thoughts..."
                  value={feedbackText} onChange={e => setFeedbackText(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback →'}
              </button>
            </form>
          </section>

          {/* Feedbacks */}
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">All Feedbacks</h2>
              <span className="section-count">{feedbacks.length} total</span>
            </div>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💭</div>
                <h3 className="empty-state-title">No Feedbacks Yet</h3>
                <p className="empty-state-text">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="card-grid">
                {feedbacks.map(f => (
                  <div key={f.id} className={`card ${canEdit(f) ? 'card-editable' : ''}`}>
                    <div className="card-header">
                      <div className="card-meta">
                        <h3 className="card-name">{f.name}</h3>
                        <span className="card-room">Room {f.room_number}</span>
                      </div>
                      {canEdit(f) && <span className="card-badge">Yours</span>}
                    </div>
                    <p className="card-content">{f.feedback}</p>
                    <div className="card-footer">
                      <span className="card-date">{formatDate(f.created_at)}</span>
                      {canEdit(f) && (
                        <div className="btn-group">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(f.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Edit Modal */}
      {editingFeedback && (
        <div className="modal-overlay" onClick={() => setEditingFeedback(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Feedback</h2>
              <button className="modal-close" onClick={() => setEditingFeedback(null)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={editName}
                        onChange={e => setEditName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Room Number</label>
                      <input type="text" className="form-input" value={editRoomNumber}
                        onChange={e => setEditRoomNumber(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Feedback</label>
                    <textarea className="form-textarea" value={editFeedbackText}
                      onChange={e => setEditFeedbackText(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingFeedback(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div>
              <div className="footer-brand">AY Residency</div>
              <div className="footer-text">© 2024 All rights reserved</div>
            </div>
            <div className="footer-links">
              <Link href="/" className="footer-link">Feedback</Link>
              <Link href="/warden" className="footer-link">Warden</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}