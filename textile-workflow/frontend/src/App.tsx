import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QrCode, FlaskConical, Factory, Recycle, ShieldCheck, FileCheck2, LayoutDashboard, Plus, ArrowRight, TrendingUp, Activity, LogOut, PackageOpen, Download } from 'lucide-react';
import './App.css';
import LoginPage from './components/Login';

// ─── Utility ───────────────────────────────────────────────────────────────
const safeArray = (v: any) => (Array.isArray(v) ? v : []);

// ─── Empty State ────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="empty-state">
    <Icon size={48} strokeWidth={1} color="#334155" />
    <p>{message}</p>
  </div>
);

// ================= MODULE 1: RAW DATA (SRS 4.1) ================= //
const RawDataModule = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({ externalId: '', material: '', weightKg: '', supplier: '' });
  const [loading, setLoading] = useState(false);
  const [lastQr, setLastQr] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/raw-data');
      const json = await res.json();
      setBatches(safeArray(json.data));
    } catch { setBatches([]); }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/raw-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, weightKg: parseFloat(form.weightKg) })
      });
      const json = await res.json();
      if (json.success) {
        setLastQr(json.data.encryptedQr);
        setForm({ externalId: '', material: '', weightKg: '', supplier: '' });
        fetchBatches();
      } else {
        setError(json.error || 'Failed to create batch');
      }
    } catch { 
      setError('Network error — is backend running?'); 
    }
    setLoading(false);
  };

  return (
    <div className="module-view animate-fade-in">
      <h2>Raw Material Tracker</h2>
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="glass-panel widget">
          <h3>Manual Batch Entry (SRS 4.1.1)</h3>
          <form onSubmit={handleSubmit}>
            <label className="form-label">Batch ID</label>
            <input className="form-input" value={form.externalId} onChange={e => setForm({...form, externalId: e.target.value})} placeholder="e.g. TX-409" required />
            <label className="form-label">Material</label>
            <input className="form-input" value={form.material} onChange={e => setForm({...form, material: e.target.value})} placeholder="e.g. Organic Hemp" required />
            <label className="form-label">Quantity (kg)</label>
            <input className="form-input" type="number" step="0.1" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} placeholder="e.g. 250" required />
            <label className="form-label">Supplier</label>
            <input className="form-input" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} placeholder="e.g. GreenFibre Co." required />
            {error && <p className="form-error">{error}</p>}
            <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Processing...' : '⚡ Generate Smart QR'}
            </button>
          </form>
          {lastQr && (
            <div className="qr-preview animate-scale-up" style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ color: 'var(--accent-primary)', fontSize: 13, marginBottom: 12 }}>✔ QR GENERATED SUCCESSFULLY</p>
              <img src={lastQr} className="qr-image" alt="Batch QR" />
            </div>
          )}
        </div>

        <div className="glass-panel widget">
          <h3>Active Inventory Batches</h3>
          {batches.length === 0 ? (
            <EmptyState icon={PackageOpen} message="No batches yet — submit a batch on the left to get started." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th><th>Material</th><th>Weight</th><th>Supplier</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.externalId}</td>
                    <td>{b.material}</td>
                    <td>{b.weightKg}kg</td>
                    <td>{b.supplier}</td>
                    <td><span className="status-badge badge-pending">{b.status}</span></td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ================= MODULE 2: CHEMICALS (SRS 4.2) ================= //
const ChemicalTracker = () => {
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', initialLiters: '', depletionRate: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchChemicals = async () => {
    try {
      const res = await fetch('/api/chemicals');
      const json = await res.json();
      setChemicals(safeArray(json.data));
    } catch { setChemicals([]); }
  };

  useEffect(() => { fetchChemicals(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/chemicals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, initialLiters: parseFloat(form.initialLiters), depletionRate: parseFloat(form.depletionRate) })
    });
    setForm({ name: '', initialLiters: '', depletionRate: '' });
    setShowForm(false);
    fetchChemicals();
  };

  const handleConsume = async (id: string) => {
    await fetch(`/api/chemicals/${id}/consume`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usedLiters: 10 })
    });
    fetchChemicals();
  };

  const lowStock = chemicals.some(c => c.currentLiters <= 20);

  const handleReplenish = async () => {
    // Bulk replenish all chemicals to 200L for demo
    await Promise.all(chemicals.map(c => 
      fetch(`/api/chemicals/${c.id}/consume`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedLiters: -1 * (200 - c.currentLiters) }) // Adding negative consumption = addition
      })
    ));
    fetchChemicals();
  };

  return (
    <div className="module-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Forest Resource Tracker</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} style={{ marginRight: 6 }} />Add Resource</button>
      </div>

      {lowStock && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, padding: 20 }}>
          <Activity size={20} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block' }}>CRITICAL_STOCK_ALERT: CHEMICAL DEPLETION</strong>
            <span style={{ fontSize: 13, opacity: 0.9 }}>Some essential chemicals are below the 20L safety threshold. Operational downtime imminent.</span>
          </div>
          <button className="btn-primary" onClick={handleReplenish} style={{ background: '#ef4444', color: 'white' }}>REPLENISH ALL STOCK</button>
        </div>
      )}

      {showForm && (
        <div className="glass-panel widget" style={{ marginBottom: 24 }}>
          <h3>New Chemical Resource</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Indigo Dye" required />
            </div>
            <div>
              <label className="form-label">Initial Liters</label>
              <input className="form-input" type="number" value={form.initialLiters} onChange={e => setForm({...form, initialLiters: e.target.value})} placeholder="e.g. 200" required />
            </div>
            <div>
              <label className="form-label">Depletion Rate (L/kg)</label>
              <input className="form-input" type="number" step="0.01" value={form.depletionRate} onChange={e => setForm({...form, depletionRate: e.target.value})} placeholder="e.g. 0.5" required />
            </div>
            <button className="btn-primary" type="submit" style={{ marginBottom: 16 }}>Save</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {chemicals.length === 0 ? (
          <EmptyState icon={FlaskConical} message="No chemicals cataloged in node." />
        ) : (
          chemicals.map(c => (
            <div className={`glass-panel widget ${c.currentLiters <= 20 ? 'alert-pulse' : ''}`} key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{c.name}</h3>
                <FlaskConical size={20} color={c.currentLiters <= 20 ? '#ef4444' : 'var(--accent-primary)'} />
              </div>
              <div className="big-value" style={{ color: c.currentLiters <= 20 ? '#ef4444' : 'inherit' }}>{c.currentLiters.toFixed(1)}L</div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(100, (c.currentLiters / 200) * 100)}%`, background: c.currentLiters <= 20 ? '#ef4444' : 'var(--accent-primary)', transition: 'width 1s ease-out' }} />
              </div>
              <p style={{ fontSize: 13, marginTop: 12, color: c.currentLiters <= 20 ? '#ef4444' : 'var(--text-dim)' }}>
                {c.currentLiters <= 20 ? '● CRITICAL STOCK' : c.currentLiters <= 50 ? '● Low Stock' : '● Optimal Level'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn-secondary" onClick={() => handleConsume(c.id)} style={{ flex: 1, padding: 8 }}>
                  -10L Log
                </button>
                <button className="btn-primary" onClick={() => fetch(`/api/chemicals/${c.id}/consume`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({usedLiters: (c.currentLiters - 200)}) }).then(() => fetchChemicals())} 
                   style={{ flex: 1, padding: 8, background: 'var(--bg-app)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                  REFILL
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ================= MODULE 3: PRODUCTION ================= //
const ProductionTracker = () => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({ batchId: '', machineId: '', machineRpm: '', estimatedHrs: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    try {
      const [pRes, bRes] = await Promise.all([fetch('/api/production'), fetch('/api/raw-data')]);
      const [pJson, bJson] = await Promise.all([pRes.json(), bRes.json()]);
      setProcesses(safeArray(pJson.data));
      setBatches(safeArray(bJson.data));
    } catch { setProcesses([]); setBatches([]); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/production', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: form.batchId, machineId: form.machineId, machineRpm: parseInt(form.machineRpm), estimatedHrs: parseFloat(form.estimatedHrs) })
    });
    setShowForm(false);
    setForm({ batchId: '', machineId: '', machineRpm: '', estimatedHrs: '' });
    fetchAll();
  };

  const handleFinish = async (id: string) => {
    const chemicalUsed = parseFloat(prompt('Enter final chemical consumption (Liters):') || '0');
    if (!chemicalUsed) return;
    await fetch(`/api/production/${id}/finish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chemicalUsed })
    });
    fetchAll();
  };

  return (
    <div className="module-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Machine Performance & Efficiency</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} style={{ marginRight: 6 }} />Start Process</button>
      </div>

      {showForm && (
        <div className="glass-panel widget" style={{ marginBottom: 24 }}>
          <h3>Start New Production Run</h3>
          <form onSubmit={handleStart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Batch</label>
              <select className="form-input" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.externalId} — {b.material}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Machine ID</label>
              <input className="form-input" value={form.machineId} onChange={e => setForm({...form, machineId: e.target.value})} placeholder="e.g. MCH-01" required />
            </div>
            <div>
              <label className="form-label">RPM</label>
              <input className="form-input" type="number" value={form.machineRpm} onChange={e => setForm({...form, machineRpm: e.target.value})} placeholder="e.g. 1200" required />
            </div>
            <div>
              <label className="form-label">Est. Hours</label>
              <input className="form-input" type="number" step="0.5" value={form.estimatedHrs} onChange={e => setForm({...form, estimatedHrs: e.target.value})} placeholder="e.g. 8" required />
            </div>
            <button className="btn-primary" type="submit" style={{ marginBottom: 16 }}>Launch</button>
          </form>
        </div>
      )}

      <div className="glass-panel widget">
        <h3>Live Production Lines (SRS 4.3.4 Prediction)</h3>
        {processes.length === 0 ? (
          <EmptyState icon={Factory} message="No production runs active. Click 'Start Process' above." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Batch</th><th>Machine</th><th>RPM</th><th>Est. Duration</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.id}>
                  <td>{p.batch?.externalId || '—'} <span style={{ fontSize: 11, color: '#64748b' }}>{p.batch?.material}</span></td>
                  <td>{p.machineId}</td>
                  <td>{p.machineRpm} RPM</td>
                  <td>{(p.estimatedHrs ?? 0).toFixed(1)} hrs</td>
                  <td>
                    <span className={`status-badge ${p.status === 'DONE' ? 'badge-done' : 'badge-pending'}`}>
                      {p.status} {p.chemicalUsed ? `(${p.chemicalUsed}L)` : ''}
                    </span>
                  </td>
                  <td>
                    {p.status !== 'DONE' && (
                      <button className="btn-secondary" onClick={() => handleFinish(p.id)} style={{ padding: '4px 8px', fontSize: 11 }}>
                        Finish Run
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ================= MODULE 4: WASTE ================= //
const WasteCirculation = () => {
  const [waste, setWaste] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({ batchId: '', type: 'Biodegradable', quantityKg: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    try {
      const [wRes, bRes] = await Promise.all([fetch('/api/waste'), fetch('/api/raw-data')]);
      const [wJson, bJson] = await Promise.all([wRes.json(), bRes.json()]);
      setWaste(safeArray(wJson.data));
      setBatches(safeArray(bJson.data));
    } catch { setWaste([]); setBatches([]); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/waste', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: form.batchId, type: form.type, quantityKg: parseFloat(form.quantityKg) })
    });
    setShowForm(false);
    setForm({ batchId: '', type: 'Biodegradable', quantityKg: '' });
    fetchAll();
  };

  return (
    <div className="module-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Waste Circulation (SRS 4.4.2)</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} style={{ marginRight: 6 }} />Log Waste</button>
      </div>

      {showForm && (
        <div className="glass-panel widget" style={{ marginBottom: 24 }}>
          <h3>Log New Waste Record</h3>
          <form onSubmit={handleLog} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Batch</label>
              <select className="form-input" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.externalId}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Waste Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>Biodegradable</option>
                <option>Non-Biodegradable</option>
                <option>Chemical Waste</option>
              </select>
            </div>
            <div>
              <label className="form-label">Quantity (kg)</label>
              <input className="form-input" type="number" step="0.1" value={form.quantityKg} onChange={e => setForm({...form, quantityKg: e.target.value})} placeholder="e.g. 12.5" required />
            </div>
            <button className="btn-primary" type="submit" style={{ marginBottom: 16 }}>Log</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {waste.length === 0 ? (
          <EmptyState icon={Recycle} message="No waste records yet. Click 'Log Waste' to add entries." />
        ) : (
          waste.map(w => (
            <div className="glass-panel widget" key={w.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="status-badge" style={{ background: '#134e4a', color: '#2dd4bf' }}>{w.type}</span>
                <span style={{ fontWeight: 'bold' }}>{w.quantityKg}kg</span>
              </div>
              <div style={{ padding: 12, background: 'rgba(45, 212, 191, 0.05)', borderRadius: 12, borderLeft: '4px solid var(--accent-primary)' }}>
                <p style={{ fontSize: 12, color: 'var(--accent-primary)', marginBottom: 4 }}>AI Upcycle Direction:</p>
                <p style={{ fontWeight: 500 }}>{w.upcycleGuidance || 'Awaiting AI analysis...'}</p>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Batch: {w.batch?.externalId || '—'} • {new Date(w.recordedAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ================= MODULE 5: COMPLIANCE ================= //
const ComplianceTracker = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ parameter: '', value: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/compliance');
      const json = await res.json();
      setLogs(safeArray(json.data));
    } catch { setLogs([]); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/compliance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameter: form.parameter, value: parseFloat(form.value) })
    });
    setShowForm(false);
    setForm({ parameter: '', value: '' });
    fetchLogs();
  };

  const presets = ['Water pH', 'CO2 Emissions', 'Noise Level (dB)', 'Effluent BOD', 'Temperature (°C)'];

  return (
    <div className="module-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Regulatory Governance (SRS 4.5)</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} style={{ marginRight: 6 }} />Log Parameter</button>
      </div>

      {showForm && (
        <div className="glass-panel widget" style={{ marginBottom: 24 }}>
          <h3>Add Compliance Reading</h3>
          <form onSubmit={handleLog} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Parameter</label>
              <select className="form-input" value={form.parameter} onChange={e => setForm({...form, parameter: e.target.value})} required>
                <option value="">Select parameter...</option>
                {presets.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Value</label>
              <input className="form-input" type="number" step="0.01" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="e.g. 7.2" required />
            </div>
            <button className="btn-primary" type="submit" style={{ marginBottom: 16 }}>Submit</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {logs.length === 0 ? (
          <EmptyState icon={ShieldCheck} message="No compliance data. Click 'Log Parameter' to record a reading." />
        ) : (
          logs.map(log => (
            <div className="glass-panel widget" key={log.id}>
              <h3>{log.parameter}</h3>
              <div className="big-value" style={{ color: log.isCompliant ? 'var(--accent-primary)' : '#ef4444' }}>
                {log.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: log.isCompliant ? '#2dd4bf' : '#ef4444', width: 8, height: 8, borderRadius: '50%' }} />
                <span style={{ color: log.isCompliant ? '#2dd4bf' : '#ef4444', fontWeight: 'bold', fontSize: 13 }}>
                  {log.isCompliant ? 'COMPLIANT' : '⚠ ALERT'}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>{new Date(log.recordedAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ================= MODULE 6: EXPORTS ================= //
const ExportTemplate = () => {
  const [exports, setExports] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({ batchId: '', type: 'INVOICE' });
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    try {
      const [eRes, bRes] = await Promise.all([fetch('/api/exports'), fetch('/api/raw-data')]);
      const [eJson, bJson] = await Promise.all([eRes.json(), bRes.json()]);
      setExports(safeArray(eJson.data));
      setBatches(safeArray(bJson.data));
    } catch { setExports([]); setBatches([]); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/exports', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: form.batchId, type: form.type })
    });
    setShowForm(false);
    setForm({ batchId: '', type: 'INVOICE' });
    fetchAll();
  };

  const handleDownload = (exp: any) => {
    const content = `
========================================
    TEXTILE INTEL - OFFICIAL ${exp.type}
========================================
Generated: ${new Date().toLocaleString()}
Document ID: ${exp.id}
----------------------------------------
BATCH DETAILS:
  ID:        ${exp.batch?.externalId || 'N/A'}
  MATERIAL:  ${exp.batch?.material || 'N/A'}
  HS CODE:   ${exp.hsCode}
  GST NUM:   ${exp.gstNumber}
----------------------------------------
CERTIFICATION:
  STATUS:    ${exp.isSigned ? 'DIGITALLY SIGNED' : 'PENDING'}
  PROTOCOL:  GRS-2026-TEXTILE-INTEL
  
This document is an electronically generated
manifest from the TEXTILE INTEL Node.
========================================`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exp.type}_${exp.batch?.externalId || 'DOC'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="module-view animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Export Intelligence (SRS 4.6)</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} style={{ marginRight: 6 }} />Generate Export</button>
      </div>

      {showForm && (
        <div className="glass-panel widget" style={{ marginBottom: 24 }}>
          <h3>Generate Export Document</h3>
          <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Batch</label>
              <select className="form-input" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.externalId} — {b.material}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Document Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>INVOICE</option>
                <option>CERTIFICATE</option>
                <option>COMPLIANCE_REPORT</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" style={{ marginBottom: 16 }}>Generate</button>
          </form>
        </div>
      )}

      <div className="glass-panel widget">
        <h3>Standardized Export Manifests</h3>
        {exports.length === 0 ? (
          <EmptyState icon={FileCheck2} message="No export documents yet. Click 'Generate Export' to create one." />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
            {exports.map(exp => (
              <div key={exp.id} className="glass-panel export-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <FileCheck2 size={32} color="var(--accent-primary)" />
                  <button onClick={() => handleDownload(exp)} className="btn-secondary" style={{ width: 'auto', padding: 8, borderRadius: 8 }}>
                    <Download size={16} />
                  </button>
                </div>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{exp.type}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Batch: {exp.batch?.externalId || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>HS Code: {exp.hsCode}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>GST: {exp.gstNumber}</p>
                <div className="status-badge badge-done" style={{ marginTop: 12, display: 'inline-block' }}>{exp.isSigned ? 'Digitally Signed' : 'Pending'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ================= LAYOUT ================= //
const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

const DashboardLayout = ({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) => (
  <div className="layout-container">
    <aside className="sidebar">
        <div className="brand-header">
          <div className="logo-orb" />
          <div>
            <h2 style={{ fontSize: 16, letterSpacing: -0.5 }}>TEXTILE INTEL</h2>
            <div style={{ fontSize: 9, color: 'var(--accent-primary)', opacity: 0.8, fontWeight: 700 }}>PROCESS SYSTEM (V1.0)</div>
          </div>
        </div>
      <nav className="nav-menu">
        <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/raw-data" icon={QrCode} label="Raw Materials" />
        <SidebarLink to="/chemicals" icon={FlaskConical} label="Forest Resources" />
        <SidebarLink to="/production" icon={Factory} label="Production Line" />
        <SidebarLink to="/waste" icon={Recycle} label="Waste Control" />
        <SidebarLink to="/compliance" icon={ShieldCheck} label="Compliance" />
        <SidebarLink to="/export" icon={FileCheck2} label="Smart Exports" />
      </nav>
      <div className="sidebar-footer">
        <div style={{ padding: '8px 16px', marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Signed in as</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{user.name}</p>
          <p style={{ fontSize: 11, color: '#2dd4bf' }}>{user.role}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={18} /><span>Logout Session</span>
        </button>
      </div>
    </aside>

    <main className="main-content">
      <header className="top-header">
        <input type="text" placeholder="Search system..." className="search-input" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f172a' }}>
            {user.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
        </div>
      </header>
      <div className="content-scroll-area">{children}</div>
    </main>
  </div>
);

// ================= DASHBOARD HOME ================= //
const DashboardHome = () => {
  const [stats, setStats] = useState({ batches: 0, processes: 0, compliance: 0, exports: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/raw-data').then(r => r.json()).catch(() => ({})),
      fetch('/api/production').then(r => r.json()).catch(() => ({})),
      fetch('/api/compliance').then(r => r.json()).catch(() => ({})),
      fetch('/api/exports').then(r => r.json()).catch(() => ({})),
    ]).then(([b, p, c, e]) => {
      setStats({
        batches: safeArray(b.data).length,
        processes: safeArray(p.data).length,
        compliance: safeArray(c.data).filter((l: any) => l.isCompliant).length,
        exports: safeArray(e.data).length,
      });
    });
  }, []);

  return (
    <div className="module-view animate-fade-in">
      <h1>Intelligence Overview</h1>
      <div className="dashboard-grid">
        <div className="glass-panel widget">
          <h3>Process Efficiency</h3>
          <div className="big-value" style={{ color: 'var(--accent-primary)' }}>92.1%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 13 }}>
            <TrendingUp size={14} /> +3.2% this week
          </div>
        </div>
        <div className="glass-panel widget">
          <h3>Active Batches</h3>
          <div className="big-value">{stats.batches}</div>
          <p style={{ fontSize: 12 }}>Raw material entries in system</p>
        </div>
        <div className="glass-panel widget">
          <h3>Compliance Score</h3>
          <div className="big-value" style={{ color: '#22c55e' }}>{stats.compliance} ✓</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 13 }}>
            <Activity size={14} /> GRS Protocol Certified
          </div>
        </div>
        <div className="glass-panel widget">
          <h3>Export Documents</h3>
          <div className="big-value">{stats.exports}</div>
          <p style={{ fontSize: 12 }}>Generated manifests</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 32 }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: 16 }}>Express Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Register Raw Batch', href: '/raw-data', icon: QrCode },
              { label: 'Log Compliance Data', href: '/compliance', icon: ShieldCheck },
              { label: 'Review Exports', href: '/export', icon: FileCheck2 },
              { label: 'Log Material Waste', href: '/waste', icon: Recycle },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href} className="quick-action-link">
                <Icon size={16} color="var(--accent-primary)" />
                <span>{label}</span>
                <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: 16 }}>Global Operational Map</h3>
          <div style={{ height: 210, background: 'rgba(24, 24, 27, 0.4)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px solid rgba(45, 212, 191, 0.05)', borderRadius: 'inherit' }} />
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', zIndex: 1 }}>
              <PackageOpen size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontSize: 14 }}>Real-time synchronization across all supply chain nodes</p>
              <div style={{ marginTop: 16, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '6px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.2)', display: 'inline-block' }}>
                ● SYSTEMS NOMINAL • {stats.processes} PROCESSES ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= APP ROOT ================= //
function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('textile_user');
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('textile_user'); } }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('textile_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('textile_user');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <Router>
      <DashboardLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/raw-data" element={<RawDataModule />} />
          <Route path="/chemicals" element={<ChemicalTracker />} />
          <Route path="/production" element={<ProductionTracker />} />
          <Route path="/waste" element={<WasteCirculation />} />
          <Route path="/compliance" element={<ComplianceTracker />} />
          <Route path="/export" element={<ExportTemplate />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
