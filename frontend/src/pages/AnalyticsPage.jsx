import React, { useState, useEffect } from 'react'; // --- Import useState and useEffect ---
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api from '../services/api'; // --- Import api ---

// --- MOCK DATA IS NOW GONE ---

const StatCard = ({ title, value, change }) => (
  <div className="stat-card">
    <span className="stat-title">{title}</span>
    <span className="stat-value">{value}</span>
    {change && <span className="stat-change">{change}</span>}
  </div>
);

const AnalyticsPage = () => {
  // --- ADD STATE TO HOLD DATA ---
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- ADD USEEFFECT TO FETCH DATA ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics/stats');
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- ADD LOADING AND ERROR STATES ---
  if (loading) {
    return <p>Loading analytics...</p>;
  }

  if (error) {
    return <p className="message-error">{error}</p>;
  }
  
  if (!stats) {
    return <p>No analytics data found.</p>
  }
  // --- END LOADING/ERROR STATES ---

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      
      {/* Top Stat Cards - NOW USES REAL DATA */}
      <div className="stat-grid">
        <StatCard title="My Containers" value={stats.myContainerCount} />
        <StatCard title="My Bookings" value={stats.myBookingsCount} />
        <StatCard title="Earnings (30d)" value={`$${stats.earnings30d}`} />
        <StatCard
          title="Carbon Savings"
          value={`${stats.carbonSavings}t CO₂`}
          change="+12% MoM"
        />
      </div>

      {/* Charts Grid - NOW USES REAL DATA */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Earnings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.earningsData}> {/* --- Use stats.earningsData --- */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Earnings" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Space Utilization %</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.utilizationData}> {/* --- Use stats.utilizationData --- */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Utilization" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Other components from screenshot */}
      <div className="other-widgets-grid">
         <div className="widget-card">
           <h3>Messages</h3>
           <p>Coming soon...</p>
         </div>
         <div className="widget-card">
           <h3>Notifications</h3>
           <p>All caught up!</p>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;