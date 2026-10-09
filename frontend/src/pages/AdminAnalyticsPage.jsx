import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const money = value => '$' + Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const panelStyle = { background: 'rgba(17, 23, 42, 0.92)', border: '1px solid rgba(173,188,226,.16)', borderRadius: 22, padding: 22, minWidth: 0 };
const chartColors = { transaction: '#8c7cff', commission: '#65e6c2', carbon: '#e8b96a' };

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setStats(data);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load marketplace analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="analytics-page"><div className="analytics-loading glass-panel">Loading marketplace-wide analytics…</div></div>;
  if (error) return <div className="analytics-page"><div className="analytics-empty glass-panel"><span className="eyebrow">PLATFORM ANALYTICS</span><h1>Marketplace performance</h1><p>{error}</p><button className="admin-action" onClick={load}>Try again</button></div></div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total users', value: stats.usersCount, note: 'registered accounts' },
    { label: 'Marketplace bookings', value: stats.demoBookingCount ?? stats.bookingCount, note: 'eligible booking records' },
    { label: 'Transaction value', value: money(stats.demoGross), note: 'marketplace booking value' },
    { label: 'Platform commission', value: money(stats.demoCommission), note: (stats.feePercent ?? 2) + '% owner share estimate' },
    { label: 'Estimated CO₂ benefit', value: Number(stats.demoCarbonSaved || 0).toFixed(2) + ' t', note: 'indicative from booked CBM' },
    { label: 'Published listings', value: stats.listingsCount, note: 'across all accounts' },
  ];

  const TrendChart = ({ title, eyebrow, data, color, suffix = '', format = 'money' }) => (
    <article style={panelStyle}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 style={{ marginTop: 8, marginBottom: 20 }}>{title}</h2>
      <div style={{ width: '100%', height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id={eyebrow.replace(/[^a-z]/gi, '') + 'Fill'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.42}/><stop offset="95%" stopColor={color} stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid stroke="rgba(173,188,226,.1)" vertical={false}/>
            <XAxis dataKey="month" tick={{ fill: '#8e9bb7', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: '#8e9bb7', fontSize: 11 }} axisLine={false} tickLine={false} width={58} tickFormatter={v => format === 'money' ? (v >= 1000 ? '$' + (v/1000).toFixed(1) + 'k' : '$' + v) : Number(v).toFixed(2) + suffix}/>
            <Tooltip formatter={v => [format === 'money' ? money(v) : Number(v).toFixed(3) + suffix, title]} contentStyle={{ background: '#11172a', border: '1px solid rgba(177,190,230,.2)', borderRadius: 12, color: '#fff' }}/>
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={'url(#' + eyebrow.replace(/[^a-z]/gi, '') + 'Fill)'} activeDot={{ r: 5 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );

  return <div className="analytics-page">
    <section className="analytics-hero">
      <div className="analytics-hero-copy">
        <span className="eyebrow"><span className="live-dot"/> ADMIN · PLATFORM INTELLIGENCE</span>
        <h1>See the <em>whole marketplace.</em></h1>
        <p>Platform-wide users, booking activity, transaction trends, owner commission and sustainability indicators.</p>
        <div className="analytics-hero-actions"><button className="btn" onClick={load}>Refresh analytics ↻</button></div>
      </div>
      <div className="analytics-hero-foot"><span>MARKETPLACE-WIDE DATA</span><span>•</span><span>LAST 6 MONTHS</span><span className="hero-foot-spacer"/><span className="hero-foot-note">Supply. Demand. Impact.</span></div>
    </section>

    <section className="analytics-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
      {cards.map((card, index) => <article key={card.label} className={'analytics-stat glass-panel ' + ['violet','cyan','mint','amber','violet','cyan'][index]}>
        <div className="analytics-stat-top"><span>{card.label}</span><span className="analytics-stat-icon">{['♙','▦','$','↗','✳','◇'][index]}</span></div>
        <strong>{card.value ?? 0}</strong>
        <div className="analytics-stat-bottom"><span>{card.note}</span></div>
        <span className="stat-index">0{index + 1}</span>
      </article>)}
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 430px), 1fr))', gap: 20, marginTop: 22 }}>
      <TrendChart title="Booking value by month" eyebrow="TRANSACTION TREND" data={stats.transactionTrend} color={chartColors.transaction}/>
      <TrendChart title="Platform commission by month" eyebrow="OWNER SHARE" data={stats.commissionTrend} color={chartColors.commission}/>
      <TrendChart title="Estimated CO₂ benefit by month" eyebrow="SUSTAINABILITY" data={stats.carbonTrend} color={chartColors.carbon} suffix=" t" format="number"/>
    </section>

    <section className="analytics-panel glass-panel" style={{ marginTop: 22, padding: 22 }}>
      <div className="analytics-panel-heading"><div><span className="eyebrow">MARKETPLACE ACTIVITY</span><h2>Recent bookings</h2><p>Buyer, seller, route, booking value and indicative platform share</p></div></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Buyer</th><th>Seller</th><th>Route</th><th>Booking value</th><th>Status</th><th>2% share</th></tr></thead>
          <tbody>{(stats.demoBookings || []).slice(0, 12).map(booking => <tr key={booking._id}>
            <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
            <td>{booking.buyer?.name || 'Buyer'}</td><td>{booking.seller?.companyName || booking.seller?.name || 'Seller'}</td>
            <td>{booking.listing ? booking.listing.origin + ' → ' + booking.listing.destination : 'Container space'}</td>
            <td>{money(booking.amount)}</td><td>{booking.status}</td><td>{money(Number(booking.amount || 0) * Number(stats.feePercent || 2) / 100)}</td>
          </tr>)}
          {!(stats.demoBookings || []).length && <tr><td colSpan="7">No booking records are available yet.</td></tr>}</tbody>
        </table>
      </div>
      <p className="admin-table-hint" style={{ marginTop: 14 }}>Commission and CO₂ values are estimates derived from marketplace booking records. Payment collection is still disabled, so these figures are not verified cash revenue or audited emissions savings.</p>
    </section>
  </div>;
};

export default AdminAnalyticsPage;
