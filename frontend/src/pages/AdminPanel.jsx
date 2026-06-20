import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';

/* Client-side allowlist is a UX hint only. Real admin authorization is
   enforced server-side (the backend returns 403 for non-admins). */
const ADMIN_EMAILS = ['anshu@stellatone.com', 'admin@visionsafe.io'];

const StatCard = ({ label, value, sub, color = 'text-neon-cyan' }) => (
  <div className="glass-panel p-3 sm:p-5 rounded-sm border border-neon-cyan/10">
    <p className="font-mono-jet text-xs text-slate-500 tracking-widest mb-1 leading-tight">{label}</p>
    <p className={`font-sora text-xl sm:text-2xl lg:text-3xl font-extrabold ${color}`}>{value}</p>
    {sub && <p className="font-mono-jet text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [flagged, setFlagged] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vs-flagged') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    const controller = new AbortController();
    fetchAllVideos(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchAllVideos = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      /* Admin feed: backend returns all users' videos for admins and 403 for
         everyone else, so authorization is enforced server-side. */
      const res = await axios.get(`${API_BASE}/videos/history`, { signal });
      setVideos(res.data.videos || []);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('You are not authorized to view this data.');
      } else {
        setError('Failed to load admin data. Please try again.');
      }
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (id) => {
    setFlagged(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('vs-flagged', JSON.stringify(next));
      return next;
    });
  };

  const deleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API_BASE}/videos/${videoId}`);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      setFlagged(prev => prev.filter(f => f !== videoId));
      setDeleteConfirm(null);
    } catch (err) {
      const status = err?.response?.status;
      alert(status === 401 || status === 403 ? 'Not authorized to delete this video.' : 'Delete failed.');
    }
  };

  if (!isAdmin) return null;

  const filtered = videos.filter(v =>
    v.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVideos = videos.length;
  const unsafeCount = videos.filter(v => v.overall_status === 'UNSAFE').length;
  const safeCount = videos.filter(v => v.overall_status === 'SAFE').length;
  const flaggedCount = flagged.length;
  const uniqueUsers = [...new Set(videos.map(v => v.user_email).filter(Boolean))].length;
  const avgConf = videos.length
    ? ((videos.reduce((a, v) => a + (v.confidence || 0), 0) / videos.length) * 100).toFixed(1)
    : '0.0';

  /* group by user for user breakdown tab */
  const userMap = {};
  videos.forEach(v => {
    const email = v.user_email || 'unknown';
    if (!userMap[email]) userMap[email] = { total: 0, safe: 0, unsafe: 0 };
    userMap[email].total++;
    if (v.overall_status === 'SAFE') userMap[email].safe++;
    else userMap[email].unsafe++;
  });
  const userRows = Object.entries(userMap).sort((a, b) => b[1].total - a[1].total);

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'videos', label: `ALL VIDEOS (${totalVideos})` },
    { id: 'flagged', label: `FLAGGED (${flaggedCount})` },
    { id: 'users', label: `USERS (${uniqueUsers})` },
  ];

  return (
    <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="glass-panel hud-frame p-5 rounded-sm mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
              <span className="font-mono-jet text-xs text-neon-red tracking-widest">ADMIN ACCESS</span>
            </div>
            <h1 className="font-sora text-xl font-black text-white">SYSTEM CONTROL PANEL</h1>
            <p className="font-mono-jet text-xs text-slate-500 mt-1">{currentUser?.email}</p>
          </div>
          <button onClick={() => fetchAllVideos()} className="btn-cyber px-4 py-2 text-xs font-mono-jet tracking-widest">
            <span>↻ REFRESH</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="glass-panel rounded-sm mb-6 px-5 py-3 border border-neon-red/30">
            <p className="font-mono-jet text-xs text-neon-red">{error}</p>
          </div>
        )}

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-1 border border-neon-cyan/10 rounded-sm p-1 glass-panel overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 font-inter text-xs font-semibold tracking-widest rounded-sm transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id ? 'bg-neon-cyan text-cyber-black font-bold' : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <StatCard label="TOTAL VIDEOS"  value={totalVideos}    color="text-neon-cyan" />
              <StatCard label="SAFE"          value={safeCount}      color="text-neon-green" />
              <StatCard label="UNSAFE"        value={unsafeCount}    color="text-neon-red" />
              <StatCard label="FLAGGED"       value={flaggedCount}   color="text-yellow-400" />
              <StatCard label="UNIQUE USERS"  value={uniqueUsers}    color="text-neon-cyan" />
              <StatCard label="AVG CONFIDENCE" value={`${avgConf}%`} color="text-neon-cyan" />
            </div>

            {/* Safety ratio bar */}
            <div className="glass-panel rounded-sm p-5 border border-neon-cyan/10">
              <p className="font-mono-jet text-xs text-slate-500 tracking-widest mb-3">SYSTEM SAFETY RATIO</p>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all"
                  style={{ width: totalVideos > 0 ? `${(safeCount / totalVideos) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-mono-jet text-xs text-neon-green">{totalVideos > 0 ? ((safeCount / totalVideos) * 100).toFixed(1) : 0}% SAFE</span>
                <span className="font-mono-jet text-xs text-neon-red">{totalVideos > 0 ? ((unsafeCount / totalVideos) * 100).toFixed(1) : 0}% UNSAFE</span>
              </div>
            </div>

            {/* Recent activity */}
            <div className="glass-panel rounded-sm overflow-hidden border border-neon-cyan/10">
              <div className="px-5 py-3 border-b border-neon-cyan/10">
                <span className="font-sora text-xs text-neon-cyan tracking-widest">RECENT ACTIVITY</span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {videos.slice(0, 8).map(v => (
                  <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-jet text-xs text-slate-300 truncate">{v.filename}</p>
                      <p className="font-mono-jet text-xs text-slate-600">{v.user_email}</p>
                    </div>
                    <span className={`font-mono-jet text-xs font-bold flex-shrink-0 ${v.overall_status === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
                      {v.overall_status}
                    </span>
                    <span className="font-mono-jet text-xs text-slate-600 flex-shrink-0">{new Date(v.upload_time).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Videos */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by filename or user email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="cyber-input w-full px-4 py-3 text-xs rounded-sm"
            />

            {loading ? (
              <div className="glass-panel p-12 rounded-sm text-center">
                <p className="font-mono-jet text-xs text-slate-500">LOADING…</p>
              </div>
            ) : (
              <div className="glass-panel rounded-sm overflow-hidden border border-neon-cyan/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neon-cyan/10">
                        {['FILENAME', 'USER', 'STATUS', 'CONFIDENCE', 'FRAMES', 'UPLOADED', 'ACTIONS'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-mono-jet text-xs text-slate-500 tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filtered.map(v => (
                        <tr key={v.id} className={`hover:bg-neon-cyan/5 transition-colors ${flagged.includes(v.id) ? 'bg-yellow-400/5' : ''}`}>
                          <td className="px-4 py-3 font-mono-jet text-xs text-slate-300 max-w-[160px] truncate">{v.filename}</td>
                          <td className="px-4 py-3 font-mono-jet text-xs text-slate-500 max-w-[140px] truncate">{v.user_email}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono-jet text-xs font-bold ${v.overall_status === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
                              {v.overall_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono-jet text-xs text-neon-cyan">{((v.confidence || 0) * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3 font-mono-jet text-xs text-slate-500">{v.total_frames || 0}</td>
                          <td className="px-4 py-3 font-mono-jet text-xs text-slate-500">{new Date(v.upload_time).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleFlag(v.id)}
                                className={`font-mono-jet text-xs transition-colors ${flagged.includes(v.id) ? 'text-yellow-400 hover:text-slate-500' : 'text-slate-600 hover:text-yellow-400'}`}
                                title={flagged.includes(v.id) ? 'Unflag' : 'Flag for review'}
                              >
                                {flagged.includes(v.id) ? '⚑ FLAGGED' : '⚐ FLAG'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(v.id)}
                                className="font-mono-jet text-xs text-slate-600 hover:text-neon-red transition-colors"
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="font-mono-jet text-xs text-slate-600">No videos found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flagged */}
        {activeTab === 'flagged' && (
          <div className="space-y-4">
            {flagged.length === 0 ? (
              <div className="glass-panel p-12 rounded-sm text-center border border-neon-cyan/10">
                <p className="font-sora text-sm text-slate-500 mb-2">NO FLAGGED VIDEOS</p>
                <p className="font-mono-jet text-xs text-slate-600">Flag videos from the All Videos tab for review here.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-sm overflow-hidden border border-yellow-400/20">
                <div className="px-5 py-3 border-b border-yellow-400/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="font-sora text-xs text-yellow-400 tracking-widest">{flaggedCount} VIDEO{flaggedCount !== 1 ? 'S' : ''} FLAGGED FOR REVIEW</span>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {videos.filter(v => flagged.includes(v.id)).map(v => (
                    <div key={v.id} className="px-5 py-4 flex items-center gap-4">
                      <span className="text-yellow-400">⚑</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono-jet text-xs text-slate-300 truncate">{v.filename}</p>
                        <p className="font-mono-jet text-xs text-slate-600">{v.user_email} · {new Date(v.upload_time).toLocaleString()}</p>
                      </div>
                      <span className={`font-mono-jet text-xs font-bold ${v.overall_status === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>{v.overall_status}</span>
                      <button onClick={() => toggleFlag(v.id)} className="font-mono-jet text-xs text-yellow-400 hover:text-slate-500 transition-colors">UNFLAG</button>
                      <button onClick={() => setDeleteConfirm(v.id)} className="font-mono-jet text-xs text-slate-600 hover:text-neon-red transition-colors">DELETE</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-sm overflow-hidden border border-neon-cyan/10">
            <div className="px-5 py-3 border-b border-neon-cyan/10">
              <span className="font-sora text-xs text-neon-cyan tracking-widest">USER BREAKDOWN</span>
            </div>
            <div className="divide-y divide-slate-800/50">
              {userRows.map(([email, data]) => (
                <div key={email} className="px-5 py-4 flex items-center gap-6">
                  <div className="w-8 h-8 rounded-sm border border-neon-cyan/30 flex items-center justify-center font-sora text-xs text-neon-cyan font-bold flex-shrink-0">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-jet text-xs text-slate-300 truncate">{email}</p>
                    <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                      <div className="h-1 rounded-full bg-neon-green" style={{ width: `${data.total > 0 ? (data.safe / data.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-6 text-right flex-shrink-0">
                    <div><p className="font-sora text-sm text-neon-cyan font-bold">{data.total}</p><p className="font-mono-jet text-xs text-slate-600">total</p></div>
                    <div><p className="font-sora text-sm text-neon-green font-bold">{data.safe}</p><p className="font-mono-jet text-xs text-slate-600">safe</p></div>
                    <div><p className="font-sora text-sm text-neon-red font-bold">{data.unsafe}</p><p className="font-mono-jet text-xs text-slate-600">unsafe</p></div>
                  </div>
                </div>
              ))}
              {userRows.length === 0 && (
                <div className="p-8 text-center">
                  <p className="font-mono-jet text-xs text-slate-600">No data available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
            <div className="glass-panel rounded-sm p-8 max-w-sm w-full neon-border-red" onClick={e => e.stopPropagation()}>
              <h2 className="font-sora text-base text-neon-red font-bold mb-3">CONFIRM DELETE</h2>
              <p className="font-mono-jet text-xs text-slate-400 mb-6 leading-relaxed">
                This will permanently delete the video record and all associated detections. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-cyber flex-1 py-2 text-xs font-mono-jet"><span>CANCEL</span></button>
                <button onClick={() => deleteVideo(deleteConfirm)} className="btn-danger flex-1 py-2 text-xs font-mono-jet">DELETE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;
