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

export default function WardenPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'room'>('newest');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const interval = setInterval(fetchFeedbacks, 30000);
    return () => clearInterval(interval);
  }, [fetchFeedbacks]);

  const filtered = feedbacks
    .filter(f => {
      const s = searchTerm.toLowerCase();
      return f.name.toLowerCase().includes(s) || 
             f.room_number.toLowerCase().includes(s) || 
             f.feedback.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return a.room_number.localeCompare(b.room_number);
    });

  const uniqueRooms = new Set(feedbacks.map(f => f.room_number)).size;
  const todayCount = feedbacks.filter(f => new Date(f.created_at).toDateString() === new Date().toDateString()).length;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatDateFull = (d: string) => new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo-link">
              <div className="logo">AY Residency</div>
            </Link>
            
            <div className="nav-container">
              <nav className="nav">
                <Link href="/" className="nav-link">Feedback</Link>
                <Link href="/warden" className="nav-link active">Warden</Link>
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
              <Link href="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Feedback
              </Link>
              <Link href="/warden" className="mobile-nav-link active" onClick={() => setMobileMenuOpen(false)}>
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
          <div className="hero">
            <h1 className="hero-title">
              <span className="hero-title-line">Warden</span>
              <span className="hero-title-line hero-title-outline">Dashboard</span>
            </h1>
            <p className="hero-subtitle">View and manage all resident feedbacks. Data syncs across devices.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{feedbacks.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{uniqueRooms}</div>
              <div className="stat-label">Rooms</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{todayCount}</div>
              <div className="stat-label">Today</div>
            </div>
          </div>

          <div className="filter-bar">
            <div className="form-group filter-group">
              <label className="form-label">Search</label>
              <input type="text" className="form-input" placeholder="Search..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="form-group filter-group-small">
              <label className="form-label">Sort</label>
              <select className="form-select" value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="room">Room</option>
              </select>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchFeedbacks}
              style={{ alignSelf: 'flex-end', marginBottom: '10px' }}>
              ↻ Refresh
            </button>
          </div>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">All Feedbacks</h2>
              <span className="section-count">{filtered.length} {searchTerm ? 'found' : 'total'}</span>
            </div>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">{searchTerm ? 'No Results' : 'No Feedbacks'}</h3>
                <p className="empty-state-text">
                  {searchTerm ? 'Try different search terms.' : 'Feedbacks will appear here.'}
                </p>
              </div>
            ) : (
              <div className="card-grid">
                {filtered.map(f => (
                  <div key={f.id} className="card card-clickable" onClick={() => setSelectedFeedback(f)}>
                    <div className="card-header">
                      <div className="card-meta">
                        <h3 className="card-name">{f.name}</h3>
                        <span className="card-room">Room {f.room_number}</span>
                      </div>
                      <span className="card-badge card-badge-outline">#{f.id.slice(0, 6)}</span>
                    </div>
                    <p className="card-content">
                      {f.feedback.length > 120 ? `${f.feedback.slice(0, 120)}...` : f.feedback}
                    </p>
                    <div className="card-footer">
                      <span className="card-date">{formatDate(f.created_at)}</span>
                      {f.updated_at !== f.created_at && (
                        <span className="card-badge card-badge-outline">Edited</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Feedback Details</h2>
              <button className="modal-close" onClick={() => setSelectedFeedback(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <span className="card-badge card-badge-outline">#{selectedFeedback.id.slice(0, 8)}</span>
              </div>
              <div className="detail-section">
                <div className="detail-label">Resident Name</div>
                <div className="detail-value">{selectedFeedback.name}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">Room Number</div>
                <div className="detail-value">{selectedFeedback.room_number}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">Feedback</div>
                <div className="detail-content">{selectedFeedback.feedback}</div>
              </div>
              <div className="detail-grid">
                <div className="detail-section">
                  <div className="detail-label">Submitted</div>
                  <div className="detail-date">{formatDateFull(selectedFeedback.created_at)}</div>
                </div>
                {selectedFeedback.updated_at !== selectedFeedback.created_at && (
                  <div className="detail-section">
                    <div className="detail-label">Updated</div>
                    <div className="detail-date">{formatDateFull(selectedFeedback.updated_at)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedFeedback(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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