import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import VideoHistory from './VideoHistory';
import DashboardStats from './DashboardStats';

const Dashboard = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [processedVideo, setProcessedVideo] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, history, stats
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setErrorMessage('');
      setProcessedVideo(null);
      setSafetyStatus(null);
    } else {
      setErrorMessage('Please select a valid video file');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle video upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a video file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('user_email', currentUser?.email || 'anonymous');

    try {
      setUploadStatus('uploading');
      setErrorMessage('');

      // Get Firebase ID token
      let token = null;
      if (currentUser) {
        try {
          token = await currentUser.getIdToken();
        } catch (tokenError) {
          console.warn('Could not get ID token:', tokenError);
        }
      }

      // Build headers
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      
      // Add Authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload video
      const response = await axios.post('http://localhost:8000/upload-video', formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        },
      });

      setUploadStatus('processing');

      // Simulate processing delay (remove if backend handles this)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set results
      setProcessedVideo(response.data.video_url);
      setSafetyStatus(response.data.status);
      setUploadStatus('completed');
      
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setUploadStatus('error');
      
      // Provide detailed error messages
      if (error.response?.status === 401) {
        setErrorMessage('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        setErrorMessage(error.response?.data?.detail || 'Invalid file format. Please upload a video file.');
      } else if (error.response?.status === 500) {
        setErrorMessage(error.response?.data?.detail || 'Server error: Video processing failed. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setErrorMessage('Network error: Cannot reach the backend server. Make sure it is running on http://localhost:8000');
      } else {
        setErrorMessage(
          error.response?.data?.detail || 
          error.response?.data?.message ||
          error.message || 
          'Failed to upload video. Please try again.'
        );
      }
    }
  };

  // Reset upload
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setProcessedVideo(null);
    setSafetyStatus(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing AI Model...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  return (
    <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="glassmorphism p-8 rounded-xl mb-8">
          <div className="flex items-center space-x-4">
            {currentUser?.photoURL && (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName}
                className="w-16 h-16 rounded-full border-2 border-accent"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-400">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {[
            { id: 'upload', label: 'Upload Video' },
            { id: 'history', label: 'History' },
            { id: 'stats', label: 'Statistics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-lg ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-lg shadow-accent/50'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
        <div className="glassmorphism p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            AI Video Analysis
          </h2>

          {/* Upload Status */}
          {uploadStatus !== 'idle' && uploadStatus !== 'error' && (
            <div className="mb-6 glassmorphism p-4 rounded-lg border border-accent/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <svg className="animate-spin h-6 w-6 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">{getStatusText()}</p>
                  <p className="text-sm text-gray-400">Please wait while we analyze your video</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 bg-unsafe/10 border border-unsafe rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-unsafe flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-unsafe font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {uploadStatus === 'idle' || uploadStatus === 'error' ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-accent bg-accent/10 scale-105'
                    : 'border-gray-600 hover:border-accent hover:bg-accent/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-full ${isDragging ? 'bg-accent/20' : 'bg-slate-800'} transition-colors`}>
                    <svg className="w-16 h-16 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">
                      {isDragging ? 'Drop your video here' : 'Drag & drop your video here'}
                    </p>
                    <p className="text-gray-400">or click to browse files</p>
                  </div>

                  {selectedFile && (
                    <div className="glassmorphism px-6 py-3 rounded-lg mt-4">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white font-medium">{selectedFile.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="text-gray-400 hover:text-unsafe transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              {selectedFile && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                    className="group relative px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent to-safe transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    <span className="relative flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload & Analyze Video
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : uploadStatus === 'completed' && processedVideo ? (
            <>
              {/* Results Section */}
              <div className="space-y-6">
                {/* Safety Status Badge */}
                <div className="flex justify-center">
                  <div className={`inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg ${
                    safetyStatus === 'SAFE' 
                      ? 'bg-safe/20 border-2 border-safe text-safe' 
                      : 'bg-unsafe/20 border-2 border-unsafe text-unsafe'
                  }`}>
                    {safetyStatus === 'SAFE' ? (
                      <>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>SAFE - No Threats Detected</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>UNSAFE - Threat Detected</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Processed Video Player */}
                <div className="glassmorphism p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Processed Video Results</h3>
                  <div className="relative rounded-lg overflow-hidden bg-slate-950">
                    <video
                      controls
                      className="w-full h-auto"
                      src={`http://localhost:8000${processedVideo}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all"
                  >
                    Analyze Another Video
                  </button>
                  <a
                    href={`http://localhost:8000${processedVideo}`}
                    download
                    className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Result
                  </a>
                </div>
              </div>
            </>
          ) : null}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Total Analyses</h3>
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <p className="text-3xl font-bold text-gradient">0</p>
              <p className="text-sm text-gray-400 mt-2">Videos processed today</p>
            </div>

            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Safe Activities</h3>
                <svg className="w-6 h-6 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-safe">0</p>
              <p className="text-sm text-gray-400 mt-2">No threats detected</p>
            </div>

            <div className="glassmorphism p-6 rounded-xl hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Accuracy</h3>
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-accent">99.9%</p>
              <p className="text-sm text-gray-400 mt-2">Detection accuracy</p>
            </div>
          </div>
        </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <VideoHistory />
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <DashboardStats />
        )}
      </div>
    </section>
  );
};

export default Dashboard;
