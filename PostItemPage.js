import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI, aiAPI } from '../utils/api';

const CATEGORIES = ['Electronics', 'Bags & Wallets', 'Clothing', 'Keys', 'ID & Cards', 'Books', 'Sports', 'Jewelry', 'Other'];
const BUILDINGS = ['Main Library', 'Science Block', 'Arts Building', 'Student Union', 'Cafeteria', 'Sports Complex', 'Admin Block', 'Hostel A', 'Hostel B', 'Parking Lot', 'Other'];

const initialForm = {
  type: 'lost', title: '', description: '', category: '',
  location: { building: '', area: '' },
  date: new Date().toISOString().split('T')[0],
  contactEmail: '', contactPhone: '', color: '', brand: ''
};

export default function PostItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef(null);

  // Auto-categorize when title/description changes
  useEffect(() => {
    if (!form.title || form.title.length < 5) { setAiSuggestion(null); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await aiAPI.categorize(form.title, form.description);
        setAiSuggestion(res.data);
      } catch (_) {}
      finally { setAiLoading(false); }
    }, 800);
  }, [form.title, form.description]);

  const applyAiCategory = () => {
    if (aiSuggestion?.category) {
      setForm(f => ({ ...f, category: aiSuggestion.category }));
      setAiSuggestion(null);
    }
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setLocation = (field, value) => setForm(f => ({ ...f, location: { ...f.location, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await itemsAPI.create(form);
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-padding" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Post an Item</h1>
        <p style={{ color: 'var(--text-muted)' }}>AI will auto-suggest a category and look for matches.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Lost / Found toggle */}
        <div className="form-group">
          <label className="form-label">Item Type</label>
          <div className="type-toggle">
            <button type="button"
              className={`type-toggle-btn ${form.type === 'lost' ? 'active-lost' : ''}`}
              onClick={() => set('type', 'lost')}>🔴 I Lost This</button>
            <button type="button"
              className={`type-toggle-btn ${form.type === 'found' ? 'active-found' : ''}`}
              onClick={() => set('type', 'found')}>🟢 I Found This</button>
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" placeholder="e.g. Black Nike Backpack" required
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" required
            placeholder="Describe the item — color, size, brand, distinctive marks..."
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Category with AI suggestion */}
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-select" required value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Select category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* AI suggestion */}
          {aiLoading && (
            <div className="ai-suggestion" style={{ marginTop: 8 }}>
              <span className="ai-badge">✨ AI</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analyzing your item…</span>
            </div>
          )}
          {aiSuggestion && !aiLoading && (
            <div className="ai-suggestion">
              <span className="ai-badge">✨ AI</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', marginBottom: 4 }}>
                  Suggested: <strong>{aiSuggestion.category}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                    ({Math.round(aiSuggestion.confidence * 100)}% confident)
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>{aiSuggestion.reasoning}</p>
                <button type="button" className="btn btn-sm btn-primary" onClick={applyAiCategory}>Apply Suggestion</button>
              </div>
            </div>
          )}
        </div>

        {/* Color + Brand */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input className="form-input" placeholder="e.g. Black, Dark Blue" value={form.color} onChange={e => set('color', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input className="form-input" placeholder="e.g. Apple, Nike" value={form.brand} onChange={e => set('brand', e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Building / Area *</label>
            <select className="form-select" value={form.location.building} onChange={e => setLocation('building', e.target.value)}>
              <option value="">Select location…</option>
              {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Specific Spot</label>
            <input className="form-input" placeholder="e.g. 3rd floor, near exit" value={form.location.area} onChange={e => setLocation('area', e.target.value)} />
          </div>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date Lost/Found *</label>
          <input type="date" className="form-input" required value={form.date} onChange={e => set('date', e.target.value)} />
        </div>

        {/* Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Contact Email *</label>
            <input type="email" className="form-input" required value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn btn-accent btn-full" disabled={loading} style={{ padding: '13px', fontSize: '1rem', marginTop: '0.5rem' }}>
          {loading ? 'Posting…' : `Post ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
        </button>
      </form>
    </div>
  );
}
