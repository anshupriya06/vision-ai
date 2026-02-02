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
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    mobileNumber: '',
    bio: ''
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!currentUser?.email) {
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE}/videos/history?email=${currentUser.email}`);
        if (!response.ok) {
          throw new Error('Failed to load video history');
        }
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser?.email]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!currentUser?.email) {
          setProfileLoading(false);
          return;
        }
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Email': currentUser.email
          }
        });
        if (response.ok) {
          const data = await response.json();
          const profileData = data.profile || {};
          setProfile({
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            mobileNumber: profileData.mobile_number || '',
            bio: profileData.bio || ''
          });
        } else {
          setProfile({
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            mobileNumber: '',
            bio: ''
          });
        }
      } catch (err) {
        setError('Failed to load profile details');
        setProfile({
          displayName: currentUser?.displayName || '',
          photoURL: currentUser?.photoURL || '',
          mobileNumber: '',
          bio: ''
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser?.displayName, currentUser?.photoURL, currentUser?.email]);

  const stats = useMemo(() => {
    const total = videos.length;
    const safe = videos.filter((v) => v.overall_status === 'SAFE').length;
    const unsafe = videos.filter((v) => v.overall_status === 'UNSAFE').length;
    const lastUpload = videos
      .map((v) => v.upload_time)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return {
      total,
      safe,
      unsafe,
      lastUpload,
    };
  }, [videos]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  const handleEditNavigate = () => {
    navigate('/profile/edit');
  };

  return (
    <section id="profile" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient">Profile</h1>
            <p className="text-gray-400 mt-2">Manage your account and review your activity</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleEditNavigate}
              className="px-5 py-3 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all"
            >
              Edit Profile
            </button>
            <button onClick={handleLogout} className="px-5 py-3 bg-unsafe/20 border border-unsafe/50 text-unsafe font-semibold rounded-xl hover:bg-unsafe/30 transition-all">
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glassmorphism p-8 rounded-2xl mb-10 transition-all hover:shadow-xl hover:shadow-accent/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full blur opacity-30"></div>
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName || 'User'}
                  className="relative w-24 h-24 rounded-full border-2 border-accent object-cover"
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center text-white text-2xl font-bold">
                  {(profile.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {profile.displayName || 'VisionSafe User'}
              </h2>
              <p className="text-gray-400">{currentUser?.email || 'user@visionsafe.io'}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm bg-accent/20 text-accent border border-accent/40">Active</span>
                <span className="px-3 py-1 rounded-full text-sm bg-white/10 text-gray-300 border border-white/10">Verified</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="glassmorphism p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white font-semibold">{currentUser?.email || 'user@visionsafe.io'}</p>
            </div>
            <div className="glassmorphism p-4 rounded-xl">
              <p className="text-gray-400 text-sm mb-1">Mobile Number</p>
              <p className="text-white font-semibold">{profile.mobileNumber || 'Not set'}</p>
            </div>
          </div>
          <div className="mt-4 glassmorphism p-4 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">Bio</p>
            <p className="text-white font-semibold">{profile.bio || 'Add a short bio from your profile settings.'}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glassmorphism p-6 rounded-xl transition-all hover:scale-[1.02]">
            <p className="text-gray-400 mb-2">Total Videos</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glassmorphism p-6 rounded-xl transition-all hover:scale-[1.02]">
            <p className="text-gray-400 mb-2">Safe Events</p>
            <p className="text-3xl font-bold text-safe">{stats.safe}</p>
          </div>
          <div className="glassmorphism p-6 rounded-xl transition-all hover:scale-[1.02]">
            <p className="text-gray-400 mb-2">Unsafe Events</p>
            <p className="text-3xl font-bold text-unsafe">{stats.unsafe}</p>
          </div>
          <div className="glassmorphism p-6 rounded-xl transition-all hover:scale-[1.02]">
            <p className="text-gray-400 mb-2">Last Upload</p>
            <p className="text-lg font-semibold text-white">
              {stats.lastUpload ? new Date(stats.lastUpload).toLocaleString() : 'No uploads yet'}
            </p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="glassmorphism p-6 rounded-2xl mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading activity...</div>
          ) : error ? (
            <div className="text-center py-12 text-unsafe">{error}</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No recent activity.</div>
          ) : (
            <div className="space-y-6">
              {videos.slice(0, 6).map((video) => (
                <div key={video.id} className="flex items-start gap-4">
                  <div className="mt-1 w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(56,189,248,0.6)]"></div>
                  <div className="flex-1 glassmorphism p-4 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold">{video.filename}</p>
                        <p className="text-gray-400 text-sm">
                          {video.upload_time ? new Date(video.upload_time).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        video.overall_status === 'SAFE'
                          ? 'bg-safe/20 text-safe border border-safe/40'
                          : 'bg-unsafe/20 text-unsafe border border-unsafe/40'
                      }`}>
                        {video.overall_status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-300">
                      <span>Confidence: {typeof video.confidence === 'number' ? `${(video.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                      <span>Duration: {Math.round(video.duration_seconds || 0)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
