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

  useEffect(() => {
    fetchVideos();
  }, []);

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
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE'
      });
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
      new Date(video.upload_time).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visionsafe-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('VisionSafe - Video History Report', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Videos: ${filteredVideos.length}`, 14, 33);
    doc.text(`Safe: ${filteredVideos.filter(v => v.overall_status === 'SAFE').length} | Unsafe: ${filteredVideos.filter(v => v.overall_status === 'UNSAFE').length}`, 14, 38);
    
    // Add table
    const tableData = filteredVideos.map(video => [
      video.filename,
      video.overall_status,
      `${(video.confidence * 100).toFixed(1)}%`,
      `${Math.round(video.duration_seconds || 0)}s`,
      video.total_frames || 0,
      new Date(video.upload_time).toLocaleDateString()
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [['Filename', 'Status', 'Confidence', 'Duration', 'Frames', 'Upload Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 35 }
      }
    });
    
    // Save PDF
    doc.save(`visionsafe-history-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredVideos = videos.filter(video => {
    const matchesFilter = filter === 'all' || video.overall_status === filter;
    const matchesSearch = video.filename.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const safeCount = videos.filter(v => v.overall_status === 'SAFE').length;
  const unsafeCount = videos.filter(v => v.overall_status === 'UNSAFE').length;

  return (
    <section id="history" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Video History</h1>
            <p className="text-gray-400">Browse and manage all your analyzed videos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredVideos.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              disabled={filteredVideos.length === 0}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glassmorphism p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Total Videos</p>
                <p className="text-3xl font-bold text-white">{videos.length}</p>
              </div>
              <div className="text-4xl">■</div>
            </div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Safe Activities</p>
                <p className="text-3xl font-bold text-safe">{safeCount}</p>
              </div>
              <div className="text-4xl">+</div>
            </div>
          </div>
          <div className="glassmorphism p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Unsafe Activities</p>
                <p className="text-3xl font-bold text-unsafe">{unsafeCount}</p>
              </div>
              <div className="text-4xl">!</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glassmorphism p-6 rounded-xl mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search videos by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-accent/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-slate-800 border border-accent/30 text-gray-300 hover:border-accent'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('SAFE')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'SAFE'
                    ? 'bg-safe text-white'
                    : 'bg-slate-800 border border-safe/30 text-gray-300 hover:border-safe'
                }`}
              >
                Safe
              </button>
              <button
                onClick={() => setFilter('UNSAFE')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'UNSAFE'
                    ? 'bg-unsafe text-white'
                    : 'bg-slate-800 border border-unsafe/30 text-gray-300 hover:border-unsafe'
                }`}
              >
                Unsafe
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <svg className="w-12 h-12 text-accent mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-400">Loading videos...</p>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="glassmorphism p-12 rounded-xl text-center">
            <div className="text-5xl mb-4">○</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Videos Found</h3>
            <p className="text-gray-400">
              {videos.length === 0
                ? "You haven't uploaded any videos yet. Start by uploading a video to analyze!"
                : "No videos match your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group cursor-pointer glassmorphism p-6 rounded-xl hover:scale-105 transition-all"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    video.overall_status === 'SAFE'
                      ? 'bg-safe/20 text-safe border border-safe/50'
                      : 'bg-unsafe/20 text-unsafe border border-unsafe/50'
                  }`}>
                    {video.overall_status}
                  </span>
                  <span className="text-2xl">■</span>
                </div>

                {/* Video Info */}
                <h3 className="text-lg font-semibold text-white mb-2 truncate">{video.filename}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(video.upload_time).toLocaleDateString()} at{' '}
                  {new Date(video.upload_time).toLocaleTimeString()}
                </p>

                {/* Confidence Score */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Confidence</span>
                    <span className="text-sm font-semibold text-accent">
                      {(video.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent to-safe h-2 rounded-full"
                      style={{ width: `${video.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{Math.round(video.duration_seconds || 0)}s</span>
                  <span>{video.total_frames || 0} frames</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVideo(video);
                    }}
                    className="flex-1 px-3 py-2 bg-accent/20 text-accent border border-accent/50 rounded-lg hover:bg-accent/30 transition-colors text-sm font-semibold"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideo(video.id);
                    }}
                    className="flex-1 px-3 py-2 bg-unsafe/20 text-unsafe border border-unsafe/50 rounded-lg hover:bg-unsafe/30 transition-colors text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Detail Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
            <div className="glassmorphism rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">{selectedVideo.filename}</h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Video Player */}
                <div className="mb-6 bg-slate-950 rounded-lg overflow-hidden">
                  {selectedVideo.processed_video_path ? (
                    <video
                      controls
                      className="w-full h-auto max-h-96"
                      src={`${API_BASE}${selectedVideo.processed_video_path}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-400">
                      <p>Video processing in progress or unavailable</p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 mb-1">Status</p>
                    <p className={`text-lg font-bold ${
                      selectedVideo.overall_status === 'SAFE' ? 'text-safe' : 'text-unsafe'
                    }`}>
                      {selectedVideo.overall_status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Confidence</p>
                    <p className="text-lg font-bold text-accent">
                      {(selectedVideo.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Duration</p>
                    <p className="text-lg font-bold text-white">{Math.round(selectedVideo.duration_seconds || 0)}s</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Total Frames</p>
                    <p className="text-lg font-bold text-white">{selectedVideo.total_frames || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Uploaded</p>
                    <p className="text-lg font-bold text-white">
                      {new Date(selectedVideo.upload_time).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">File Size</p>
                    <p className="text-lg font-bold text-white">
                      {((selectedVideo.file_size_bytes || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {selectedVideo.processed_video_path && (
                    <a
                      href={`${API_BASE}${selectedVideo.processed_video_path}`}
                      download
                      className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const reportText = `VisionSafe Analysis Report\n\nFilename: ${selectedVideo.filename}\nStatus: ${selectedVideo.overall_status}\nConfidence: ${(selectedVideo.confidence * 100).toFixed(1)}%\nDuration: ${Math.round(selectedVideo.duration_seconds || 0)}s\nFrames: ${selectedVideo.total_frames || 0}\nUploaded: ${new Date(selectedVideo.upload_time).toLocaleString()}\n\nPowered by VisionSafe AI`;
                      
                      if (navigator.share) {
                        navigator.share({
                          title: 'VisionSafe Report',
                          text: reportText,
                        }).catch(err => console.log('Share cancelled'));
                      } else {
                        navigator.clipboard.writeText(reportText);
                        alert('Report copied to clipboard!');
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={() => {
                      deleteVideo(selectedVideo.id);
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-6 py-3 bg-unsafe/20 border border-unsafe text-unsafe font-semibold rounded-xl hover:bg-unsafe/30 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
