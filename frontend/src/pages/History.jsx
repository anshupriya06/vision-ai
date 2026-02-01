import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
        const response = await fetch(`http://localhost:8000/videos/history?email=${currentUser.email}`);
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
      const response = await fetch(`http://localhost:8000/videos/${videoId}`, {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Video History</h1>
          <p className="text-gray-400">Browse and manage all your analyzed videos</p>
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
                      src={`http://localhost:8000${selectedVideo.processed_video_path}`}
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
                <div className="flex gap-4">
                  {selectedVideo.processed_video_path && (
                    <a
                      href={`http://localhost:8000${selectedVideo.processed_video_path}`}
                      download
                      className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-all text-center"
                    >
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => {
                      deleteVideo(selectedVideo.id);
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-6 py-3 bg-unsafe/20 border border-unsafe text-unsafe font-semibold rounded-xl hover:bg-unsafe/30 transition-all"
                  >
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
