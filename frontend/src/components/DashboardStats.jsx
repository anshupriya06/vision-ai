import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config/api';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardStats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const COLORS = {
    safe: '#10b981',
    unsafe: '#ef4444',
    primary: '#3b82f6',
    accent: '#8b5cf6'
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/videos/stats/${currentUser?.email}`
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if no data
      setStats({
        total_videos: 0,
        safe_videos: 0,
        unsafe_videos: 0,
        average_confidence: 0,
        unsafe_percentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, color, icon }) => (
    <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`text-4xl opacity-50 ${color}`}>{icon}</div>
      </div>
    </div>
  );

  // Prepare chart data
  const pieData = stats ? [
    { name: 'Safe', value: stats.safe_videos, color: COLORS.safe },
    { name: 'Unsafe', value: stats.unsafe_videos, color: COLORS.unsafe }
  ] : [];

  const confidenceData = stats ? [
    { name: 'Current Avg', value: (stats.average_confidence * 100).toFixed(1) },
    { name: 'Target', value: 95 }
  ] : [];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Safety Statistics</h2>
        <p className="text-slate-400">Your video processing overview with detailed analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Videos"
          value={stats.total_videos}
          color="text-blue-400"
          icon="📹"
        />
        <StatCard
          title="Safe Videos"
          value={stats.safe_videos}
          color="text-emerald-400"
          icon="✓"
        />
        <StatCard
          title="Unsafe Videos"
          value={stats.unsafe_videos}
          color="text-red-400"
          icon="⚠️"
        />
        <StatCard
          title="Avg Confidence"
          value={`${(stats.average_confidence * 100).toFixed(1)}%`}
          color="text-yellow-400"
          icon="🎯"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart - Safety Distribution */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Safety Distribution</h3>
          {stats.total_videos > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available yet
            </div>
          )}
        </div>

        {/* Bar Chart - Confidence Comparison */}
        <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Confidence Analysis</h3>
          {stats.total_videos > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  style={{ fontSize: '14px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '14px' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill={COLORS.accent} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No data available yet
            </div>
          )}
        </div>
      </div>

      {/* Safety Score Bar */}
      <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Safety Score</h3>
            <span className="text-2xl font-bold text-emerald-400">
              {(100 - stats.unsafe_percentage).toFixed(0)}%
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {stats.total_videos === 0
              ? 'No videos processed yet'
              : `${stats.unsafe_videos} unsafe detections out of ${stats.total_videos} videos`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
            style={{
              width: `${100 - stats.unsafe_percentage}%`
            }}
          ></div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">Unsafe</span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
}
