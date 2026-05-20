import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config/api';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({ displayName: '', photoURL: '', mobileNumber: '', bio: '' });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!currentUser?.email) { setLoading(false); return; }
        const r = await fetch(`${API_BASE}/videos/history?email=${currentUser.email}`);
        if (!r.ok) throw new Error('Failed to load history');
        const d = await r.json();
        setVideos(d.videos || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [currentUser?.email]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!currentUser?.email) return;
        const token = await currentUser.getIdToken();
        const r = await fetch(`${API_BASE}/user/profile`, { headers: { Authorization: `Bearer ${token}`, 'X-User-Email': currentUser.email } });
        const base = { displayName: currentUser.displayName || '', photoURL: currentUser.photoURL || '', mobileNumber: '', bio: '' };
        if (r.ok) { const d = await r.json(); setProfile({ ...base, mobileNumber: d.profile?.mobile_number || '', bio: d.profile?.bio || '' }); }
        else setProfile(base);
      } catch { setProfile({ displayName: currentUser?.displayName || '', photoURL: currentUser?.photoURL || '', mobileNumber: '', bio: '' }); }
    };
    fetchProfile();
  }, [currentUser?.displayName, currentUser?.photoURL, currentUser?.email]);

  const stats = useMemo(() => {
    const total = videos.length;
    const safe = videos.filter(v => v.overall_status === 'SAFE').length;
    const unsafe = videos.filter(v => v.overall_status === 'UNSAFE').length;
    const lastUpload = videos.map(v => v.upload_time).filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];
    return { total, safe, unsafe, lastUpload };
  }, [videos]);

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-sora text-2xl font-black text-white tracking-wider">OPERATOR <span className="text-neon-cyan">PROFILE</span></h1>
            <p className="font-mono-jet text-xs text-slate-500 tracking-wide mt-1">IDENTITY MANAGEMENT SYSTEM</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/profile/edit')} className="btn-cyber px-5 py-2 text-xs font-mono-jet tracking-widest"><span>EDIT PROFILE</span></button>
            <button onClick={async () => { try { await logout(); } catch { setError('Logout failed.'); } }} className="btn-danger px-5 py-2 text-xs font-mono-jet tracking-widest">LOGOUT</button>
          </div>
        </div>

        {/* Identity card */}
        <div className="glass-panel hud-frame rounded-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-sm bg-neon-cyan/10 animate-glow-pulse" />
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="" className="relative w-20 h-20 rounded-sm ring-2 ring-neon-cyan object-cover" />
              ) : (
                <div className="relative w-20 h-20 rounded-sm ring-2 ring-neon-cyan bg-cyber-navy flex items-center justify-center font-sora text-2xl font-black text-neon-cyan">
                  {(profile.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="font-sora text-xl font-bold text-white">{profile.displayName || 'OPERATOR'}</h2>
              <p className="font-mono-jet text-sm text-neon-cyan">{currentUser?.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge-safe">ACTIVE</span>
                <span className="font-mono-jet text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded-sm">VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {[
              { label: 'EMAIL', value: currentUser?.email || '—' },
              { label: 'MOBILE', value: profile.mobileNumber || 'NOT SET' },
            ].map((f, i) => (
              <div key={i} className="bg-cyber-black/50 border border-neon-cyan/10 rounded-sm p-3">
                <p className="font-mono-jet text-xs text-slate-500 tracking-widest mb-1">{f.label}</p>
                <p className="font-mono-jet text-sm text-white">{f.value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 bg-cyber-black/50 border border-neon-cyan/10 rounded-sm p-3">
              <p className="font-mono-jet text-xs text-slate-500 tracking-widest mb-1">BIO</p>
              <p className="font-mono-jet text-sm text-white">{profile.bio || 'No bio configured.'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'TOTAL FEEDS', value: stats.total, color: 'text-neon-cyan' },
            { label: 'SAFE', value: stats.safe, color: 'text-neon-green' },
            { label: 'UNSAFE', value: stats.unsafe, color: 'text-neon-red' },
            { label: 'LAST UPLOAD', value: stats.lastUpload ? new Date(stats.lastUpload).toLocaleDateString() : '—', color: 'text-slate-300' },
          ].map((s, i) => (
            <div key={i} className="glass-panel rounded-sm p-4 hover:border-neon-cyan/30 transition-all">
              <p className="font-mono-jet text-xs text-slate-500 tracking-widest mb-2">{s.label}</p>
              <p className={`font-sora text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="glass-panel rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center justify-between">
            <span className="font-sora text-xs text-neon-cyan tracking-widest">RECENT ACTIVITY LOG</span>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="font-mono-jet text-xs text-slate-500 text-center py-8 tracking-wide">LOADING LOG...</p>
            ) : error ? (
              <p className="font-mono-jet text-xs text-neon-red text-center py-8">{error}</p>
            ) : videos.length === 0 ? (
              <p className="font-mono-jet text-xs text-slate-500 text-center py-8 tracking-wide">NO ACTIVITY RECORDED</p>
            ) : (
              <div className="space-y-2">
                {videos.slice(0, 6).map(video => (
                  <div key={video.id} className="flex items-center gap-4 p-3 bg-cyber-black/40 border border-neon-cyan/5 rounded-sm hover:border-neon-cyan/20 transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${video.overall_status === 'SAFE' ? 'bg-neon-green' : 'bg-neon-red'} animate-pulse`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-jet text-xs text-white truncate">{video.filename}</p>
                      <p className="font-mono-jet text-xs text-slate-600">{video.upload_time ? new Date(video.upload_time).toLocaleString() : 'N/A'}</p>
                    </div>
                    <span className={video.overall_status === 'SAFE' ? 'badge-safe' : 'badge-unsafe'}>{video.overall_status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
