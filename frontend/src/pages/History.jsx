import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const History = () => {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      if (currentUser?.email) {
        const response = await fetch(`${API_BASE}/videos/history?email=${currentUser.email}`);
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      const headers = {};
      if (currentUser) {
        try { headers['Authorization'] = `Bearer ${await currentUser.getIdToken()}`; } catch {}
      }
      const response = await fetch(`${API_BASE}/videos/${videoId}`, { method: 'DELETE', headers });
      if (response.ok) {
        setVideos(videos.filter(v => v.id !== videoId));
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Filename', 'Status', 'Confidence', 'Duration (s)', 'Total Frames', 'Upload Time'];
    const csvData = filteredVideos.map(video => [
      video.filename,
      video.overall_status,
      `${(video.confidence * 100).toFixed(1)}%`,
      Math.round(video.duration_seconds || 0),
      video.total_frames || 0,
      new Date(video.upload_time).toLocaleString(),
    ]);
    const csvContent = [headers.join(','), ...csvData.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visionsafe-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(0, 240, 255);
    doc.text('VisionSafe — Video History Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Videos: ${filteredVideos.length}`, 14, 33);
    doc.text(`Safe: ${filteredVideos.filter(v => v.overall_status === 'SAFE').length} | Unsafe: ${filteredVideos.filter(v => v.overall_status === 'UNSAFE').length}`, 14, 38);
    doc.autoTable({
      startY: 45,
      head: [['Filename', 'Status', 'Confidence', 'Duration', 'Frames', 'Upload Date']],
      body: filteredVideos.map(video => [
        video.filename, video.overall_status,
        `${(video.confidence * 100).toFixed(1)}%`,
        `${Math.round(video.duration_seconds || 0)}s`,
        video.total_frames || 0,
        new Date(video.upload_time).toLocaleDateString(),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 240, 255], textColor: [2, 6, 23], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' }, 3: { cellWidth: 20, halign: 'center' }, 4: { cellWidth: 20, halign: 'center' }, 5: { cellWidth: 35 } },
    });
    doc.save(`visionsafe-history-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredVideos = videos.filter(video => {
    const matchesFilter     = filter === 'all' || video.overall_status === filter;
    const matchesSearch     = video.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConfidence = (video.confidence * 100) >= minConfidence;
    return matchesFilter && matchesSearch && matchesConfidence;
  });

  const safeCount   = videos.filter(v => v.overall_status === 'SAFE').length;
  const unsafeCount = videos.filter(v => v.overall_status === 'UNSAFE').length;

  const statusColor = (s) => s?.toLowerCase() === 'safe' ? 'text-neon-green' : 'text-neon-red';
  const statusBg    = (s) => s?.toLowerCase() === 'safe'
    ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
    : 'bg-neon-red/10 border border-neon-red/30 text-neon-red';

  return (
    <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-sora text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
              Video <span className="text-neon-cyan">History</span>
            </h1>
            <p className="font-inter text-sm text-slate-400">Browse and manage all your analyzed videos</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={exportToCSV}
              disabled={filteredVideos.length === 0}
              className="btn-cyber px-3 sm:px-4 py-2 text-xs font-inter font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              disabled={filteredVideos.length === 0}
              className="btn-cyber px-3 sm:px-4 py-2 text-xs font-inter font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Videos',      value: videos.length, color: 'text-neon-cyan',  icon: '▣' },
            { label: 'Safe Activities',   value: safeCount,     color: 'text-neon-green', icon: '✓' },
            { label: 'Unsafe Activities', value: unsafeCount,   color: 'text-neon-red',   icon: '⚠' },
          ].map((s, i) => (
            <div key={i} className="glass-panel hud-frame p-3 sm:p-5 lg:p-6 rounded-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-inter text-xs text-slate-400 mb-1 leading-tight">{s.label}</p>
                  <p className={`font-sora text-xl sm:text-2xl lg:text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                </div>
                <span className={`text-lg sm:text-2xl opacity-40 ${s.color} hidden xs:block`}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search, Filter, Confidence */}
        <div className="glass-panel p-4 sm:p-5 lg:p-6 rounded-sm mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="cyber-input w-full sm:flex-1 px-3 sm:px-4 py-2.5 text-sm rounded-sm"
            />
            {/* Status filter */}
            <div className="flex gap-2 flex-shrink-0">
              {['all', 'SAFE', 'UNSAFE'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-sm font-inter text-xs font-semibold tracking-widest transition-all ${
                    filter === f
                      ? f === 'SAFE'   ? 'bg-neon-green/20 border border-neon-green text-neon-green'
                      : f === 'UNSAFE' ? 'bg-neon-red/20 border border-neon-red text-neon-red'
                      :                  'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan'
                      : 'glass-panel border border-white/10 text-slate-400 hover:text-neon-cyan'
                  }`}
                >
                  {f === 'all' ? 'ALL' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono-jet text-xs text-slate-400 tracking-widest">MIN CONFIDENCE</label>
              <div className="flex items-center gap-2">
                <span className="font-sora text-sm font-bold text-neon-cyan">{minConfidence}%</span>
                {minConfidence > 0 && (
                  <button onClick={() => setMinConfidence(0)} className="font-mono-jet text-xs text-slate-500 hover:text-neon-red transition-colors">✕ reset</button>
                )}
              </div>
            </div>
            <input
              type="range" min={0} max={100} step={5} value={minConfidence}
              onChange={e => setMinConfidence(Number(e.target.value))}
              className="confidence-range"
              style={{ '--val': `${minConfidence}%` }}
            />
            <div className="flex justify-between mt-1">
              {['0%', '50%', '100%'].map(v => <span key={v} className="font-mono-jet text-xs text-slate-600">{v}</span>)}
            </div>
            {minConfidence > 0 && (
              <p className="font-mono-jet text-xs text-slate-500 mt-1.5">
                Showing {filteredVideos.length} of {videos.length} videos with confidence ≥ {minConfidence}%
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 gap-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-neon-cyan animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="font-inter text-sm text-slate-400">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="glass-panel hud-frame p-8 sm:p-12 rounded-sm text-center">
            <div className="w-12 h-12 rounded-full border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-neon-cyan/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-sora text-lg sm:text-xl font-bold text-white mb-2">No Videos Found</h3>
            <p className="font-inter text-sm text-slate-400">
              {videos.length === 0
                ? "You haven't uploaded any videos yet. Start by uploading a video to analyze!"
                : "No videos match your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer glass-panel rounded-sm p-4 sm:p-5 hover:border-neon-cyan/30 border border-transparent transition-all hover:shadow-neon-cyan"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <span className={`px-2.5 py-1 rounded-sm text-xs font-sora font-semibold tracking-widest ${statusBg(video.overall_status)}`}>
                    {video.overall_status === 'SAFE' ? '✓ ' : '⚠ '}{video.overall_status}
                  </span>
                  <span className="font-mono-jet text-xs text-slate-600">
                    {new Date(video.upload_time).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-inter text-sm font-semibold text-white mb-2 truncate">{video.filename}</h3>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-mono-jet text-xs text-slate-500">Confidence</span>
                    <span className={`font-sora text-xs font-bold ${statusColor(video.overall_status)}`}>
                      {(video.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${video.overall_status === 'SAFE' ? 'bg-neon-green' : 'bg-neon-red'}`}
                      style={{ width: `${video.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex justify-between font-mono-jet text-xs text-slate-500 mb-4">
                  <span>{Math.round(video.duration_seconds || 0)}s</span>
                  <span>{video.total_frames || 0} frames</span>
                  <span>{((video.file_size_bytes || 0) / 1024 / 1024).toFixed(1)} MB</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedVideo(video); }}
                    className="flex-1 px-3 py-1.5 rounded-sm border border-neon-cyan/30 text-neon-cyan font-inter text-xs font-semibold hover:bg-neon-cyan/10 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteVideo(video.id); }}
                    className="flex-1 px-3 py-1.5 rounded-sm border border-neon-red/30 text-neon-red font-inter text-xs font-semibold hover:bg-neon-red/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Detail Modal — full screen on mobile */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="glass-panel rounded-t-2xl sm:rounded-sm w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 glass-panel px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-neon-cyan/10 flex justify-between items-start gap-3 z-10">
                <h2 className="font-sora text-base sm:text-xl font-bold text-white truncate">{selectedVideo.filename}</h2>
                <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-neon-red transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-6 sm:pt-5">
                {/* Video player */}
                <div className="mb-5 bg-slate-950 rounded-sm overflow-hidden">
                  {selectedVideo.processed_video_path ? (
                    <video controls className="w-full h-auto max-h-64 sm:max-h-96"
                      src={`${API_BASE}${selectedVideo.processed_video_path}`}>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-40 sm:h-64 flex items-center justify-center">
                      <p className="font-inter text-sm text-slate-400">Video unavailable</p>
                    </div>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                  {[
                    { label: 'Status',       value: selectedVideo.overall_status, cls: statusColor(selectedVideo.overall_status) },
                    { label: 'Confidence',   value: `${(selectedVideo.confidence * 100).toFixed(1)}%`, cls: 'text-neon-cyan' },
                    { label: 'Duration',     value: `${Math.round(selectedVideo.duration_seconds || 0)}s`, cls: 'text-white' },
                    { label: 'Frames',       value: selectedVideo.total_frames || 0, cls: 'text-white' },
                    { label: 'File Size',    value: `${((selectedVideo.file_size_bytes || 0) / 1024 / 1024).toFixed(2)} MB`, cls: 'text-white' },
                    { label: 'Uploaded',     value: new Date(selectedVideo.upload_time).toLocaleDateString(), cls: 'text-white' },
                  ].map((d, i) => (
                    <div key={i} className="glass-panel p-3 rounded-sm">
                      <p className="font-mono-jet text-xs text-slate-500 mb-1">{d.label}</p>
                      <p className={`font-sora text-sm font-bold ${d.cls}`}>{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                  {selectedVideo.processed_video_path && (
                    <a
                      href={`${API_BASE}${selectedVideo.processed_video_path}`}
                      download
                      className="flex-1 btn-cyber-solid px-4 py-2.5 text-xs font-inter font-semibold text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const text = `VisionSafe Report\nFile: ${selectedVideo.filename}\nStatus: ${selectedVideo.overall_status}\nConfidence: ${(selectedVideo.confidence * 100).toFixed(1)}%\nPowered by VisionSafe AI`;
                      if (navigator.share) { navigator.share({ title: 'VisionSafe Report', text }).catch(() => {}); }
                      else { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); }
                    }}
                    className="flex-1 btn-cyber px-4 py-2.5 text-xs font-inter font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => { deleteVideo(selectedVideo.id); setSelectedVideo(null); }}
                    className="flex-1 btn-danger px-4 py-2.5 text-xs font-inter font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default History;
