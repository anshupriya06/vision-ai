import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config/api';
import axios from 'axios';

export default function VideoHistory() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [detections, setDetections] = useState([]);
  const [showDetections, setShowDetections] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const controller = new AbortController();
    fetchVideoHistory(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchVideoHistory = async (signal) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/videos/history`, {
        params: { email: currentUser?.email },
        signal,
      });
      setVideos(response.data.videos || []);
    } catch (error) {
      if (axios.isCancel?.(error) || error?.name === 'CanceledError') return;
      console.error('Error fetching video history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetections = async (videoId) => {
    try {
      const response = await axios.get(`${API_BASE}/videos/${videoId}/detections`);
      setDetections(response.data.detections || []);
      setShowDetections(true);
    } catch (error) {
      console.error('Error fetching detections:', error);
    }
  };

  const handleViewDetails = async (video) => {
    setSelectedVideo(video);
    await fetchDetections(video.id);
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`${API_BASE}/videos/${videoId}`);
        setVideos(videos.filter(v => v.id !== videoId));
        setSelectedVideo(null);
        setShowDetections(false);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    return status?.toLowerCase() === 'safe' ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusBgColor = (status) => {
    return status?.toLowerCase() === 'safe' ? 'bg-emerald-500/20' : 'bg-red-500/20';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Video History</h2>
        <p className="text-slate-400">View all processed videos and detection results</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-slate-400 text-lg">No videos processed yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video List */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="divide-y divide-white/10">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(video)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white truncate">
                          {video.filename}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-slate-400">
                            {new Date(video.upload_time).toLocaleDateString()}
                          </span>
                          <span className={getStatusColor(video.overall_status)}>
                            {(video.overall_status || 'UNKNOWN').toUpperCase()}
                          </span>
                          <span className="text-slate-400">
                            {video.overall_status?.toUpperCase() === 'SAFE'
                              ? `Prediction (Safe): ${video.safe_percentage != null
                                  ? `${video.safe_percentage.toFixed(1)}%`
                                  : (video.confidence != null ? `${(video.confidence * 100).toFixed(1)}%` : '—')}`
                              : `Prediction (Unsafe): ${video.unsafe_percentage != null
                                  ? `${video.unsafe_percentage.toFixed(1)}%`
                                  : (video.confidence != null ? `${((1 - video.confidence) * 100).toFixed(1)}%` : '—')}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className={`${getStatusBgColor(video.overall_status)} px-3 py-1 rounded-lg`}>
                        <span className={getStatusColor(video.overall_status)}>
                          {video.overall_status?.toLowerCase() === 'safe' ? '✓' : '⚠️'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          {selectedVideo && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Filename</p>
                    <p className="text-white font-mono text-sm truncate">
                      {selectedVideo.filename}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <p className={`font-semibold ${getStatusColor(selectedVideo.overall_status)}`}>
                      {(selectedVideo.overall_status || 'UNKNOWN').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Confidence</p>
                    <p className="text-white">
                      {selectedVideo.confidence != null
                        ? `${(selectedVideo.confidence * 100).toFixed(2)}%`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">
                      {selectedVideo.overall_status?.toUpperCase() === 'SAFE' 
                        ? 'Prediction (Safe)' 
                        : 'Prediction (Unsafe)'}
                    </p>
                    <p className="text-white">
                      {selectedVideo.overall_status?.toUpperCase() === 'SAFE'
                        ? (selectedVideo.safe_percentage != null
                            ? `${selectedVideo.safe_percentage.toFixed(1)}%`
                            : (selectedVideo.confidence != null ? `${(selectedVideo.confidence * 100).toFixed(1)}%` : '—'))
                        : (selectedVideo.unsafe_percentage != null
                            ? `${selectedVideo.unsafe_percentage.toFixed(1)}%`
                            : (selectedVideo.confidence != null ? `${((1 - selectedVideo.confidence) * 100).toFixed(1)}%` : '—'))
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Duration</p>
                    <p className="text-white">
                      {selectedVideo.duration_seconds != null
                        ? `${selectedVideo.duration_seconds.toFixed(2)}s`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedVideo.video_url && (
                <div className="mb-6 border-t border-white/10 pt-6">
                  <h4 className="font-semibold text-white mb-3">Processed Video</h4>
                  <div className="rounded-lg overflow-hidden bg-slate-950">
                    <video
                      src={`${API_BASE}${selectedVideo.video_url}`}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-auto"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Detections */}
              {showDetections && (
                <div className="mb-6 border-t border-white/10 pt-6">
                  <h4 className="font-semibold text-white mb-3">
                    Detections ({detections.length})
                  </h4>
                  {detections.length === 0 ? (
                    <p className="text-slate-400 text-sm">No detections found</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {detections.map((detection) => (
                        <div
                          key={detection.id}
                          className="bg-white/5 rounded p-2 text-sm"
                        >
                          <div className="flex justify-between">
                            <span className="text-white font-mono">
                              {detection.activity_label}
                            </span>
                            <span className={getStatusColor(detection.safety_status)}>
                              {detection.safety_status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">
                            Frame {detection.frame_number} @ {detection.timestamp_seconds.toFixed(2)}s
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedVideo.id)}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
