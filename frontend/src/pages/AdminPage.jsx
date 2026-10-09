import React, { useEffect, useState } from 'react';
import api from '../services/api';

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})}`;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [platform, setPlatform] = useState(null);
  const [platformError, setPlatformError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatform = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setPlatform(data);
      setPlatformError('');
    } catch (err) {
      setPlatformError(err?.response?.data?.message || 'Unable to load platform earnings.');
    }
  };

  useEffect(() => {
    loadUsers();
    loadPlatform();
  }, []);

  const openUser = async (id) => {
    try {
      setSelectedId(id);
      setDetailLoading(true);
      setMessage('');
      const { data } = await api.get(`/admin/users/${id}/overview`);
      setOverview(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load user analytics.');
    } finally {
      setDetailLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setMessage('User role updated.');
      await loadUsers();
      if (selectedId === id) openUser(id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update role.');
    }
  };

  const maxListingPrice = Math.max(...(overview?.listings || []).map((item) => item.pricePerCBM), 1);
  const maxPurchase = Math.max(...(overview?.purchases || []).map((item) => item.amount), 1);

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">ADMIN CONSOLE</span>
          <h1>ShipSpace Control Center</h1>
          <p>Manage users and inspect marketplace activity, listings and purchase behaviour.</p>
        </div>
        <div className="admin-stat">
          <strong>{users.length}</strong>
          <span>Registered users</span>
        </div>
      </div>

      <div className="admin-notice">
        <strong>Security:</strong> passwords are never displayed. They are stored as secure hashes.
        Demo accounts use the password configured in Render.
      </div>

      <section className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow dark">OWNER REVENUE</span>
            <h2>Platform commission</h2>
            <p style={{ marginTop: 6 }}>Current fee: {platform?.feePercent ?? 2}% of successfully paid bookings.</p>
          </div>
          <button className="admin-action" onClick={loadPlatform}>Refresh analytics</button>
        </div>
        {platformError && <p className="message-error">{platformError}</p>}
        <div className="detail-kpis" style={{ marginTop: 16 }}>
          <div className="mini-kpi accent"><span>Earned commission</span><strong>{money(platform?.platformRevenue)}</strong><small>verified paid bookings only</small></div>
          <div className="mini-kpi"><span>Paid transaction value</span><strong>{money(platform?.paidGross)}</strong><small>{platform?.paidBookingCount ?? 0} paid bookings</small></div>
          <div className="mini-kpi"><span>Potential commission</span><strong>{money(platform?.potentialFee)}</strong><small>estimate from active unpaid requests</small></div>
          <div className="mini-kpi"><span>Marketplace activity</span><strong>{platform?.bookingCount ?? 0}</strong><small>{platform?.usersCount ?? users.length} users · {platform?.listingsCount ?? 0} listings</small></div>
        </div>
        <p className="admin-table-hint" style={{ marginTop: 14 }}>
          Payment checkout is still disabled. Therefore demo requests contribute only to the potential commission estimate; actual earned commission stays $0 until a real payment is verified.
        </p>
        <div style={{ overflowX: 'auto', marginTop: 18 }}>
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Buyer</th><th>Seller</th><th>Route</th><th>Booking value</th><th>Status</th><th>Est. fee</th></tr></thead>
            <tbody>
              {(platform?.recentBookings || []).length ? platform.recentBookings.map((booking) => {
                const isPaid = booking.paymentStatus === 'paid' && booking.status === 'confirmed';
                const isActive = ['pending', 'accepted'].includes(booking.status) && booking.paymentStatus !== 'paid';
                const fee = Number(booking.amount || 0) * Number(platform?.feePercent ?? 2) / 100;
                return <tr key={booking._id}>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>{booking.buyer?.name || 'Unknown buyer'}</td>
                  <td>{booking.seller?.companyName || booking.seller?.name || 'Unknown seller'}</td>
                  <td>{booking.listing ? `${booking.listing.origin} → ${booking.listing.destination}` : 'Listing unavailable'}</td>
                  <td>{money(booking.amount)}</td>
                  <td><span className={`role-pill ${isPaid ? 'admin' : 'user'}`}>{isPaid ? 'paid' : booking.status}</span></td>
                  <td>{money(isPaid || isActive ? fee : 0)}{isPaid ? '' : ' est.'}</td>
                </tr>;
              }) : <tr><td colSpan="7">No booking transactions yet. Demo activity appears here after the seed runs.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {message && <div className="message-success">{message}</div>}
      {error && <div className="message-error">{error}</div>}

      {loading ? (
        <div className="admin-card">Loading users...</div>
      ) : (
        <div className="admin-layout">
          <section className="admin-card admin-table-wrap">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow dark">USER DIRECTORY</span>
                <h2>Accounts & activity</h2>
              </div>
              <span className="admin-count">{users.length} accounts</span>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr
                    key={account._id}
                    className={selectedId === account._id ? 'selected-row' : ''}
                    onClick={() => openUser(account._id)}
                  >
                    <td>
                      <button className="user-cell" onClick={() => openUser(account._id)}>
                        <span className="avatar">{account.name?.charAt(0)}</span>
                        <span>
                          <strong>{account.name}</strong>
                          <small>{account.email}</small>
                        </span>
                      </button>
                    </td>
                    <td>{account.companyName}</td>
                    <td><span className={`role-pill ${account.role}`}>{account.role}</span></td>
                    <td>{account.subscriptionTier}</td>
                    <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="admin-action"
                        onClick={() => changeRole(account._id, account.role === 'admin' ? 'user' : 'admin')}
                      >
                        {account.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="admin-table-hint">Click any user row to open their complete marketplace activity.</p>
          </section>

          <aside className="admin-detail">
            {!selectedId ? (
              <div className="admin-card admin-empty">
                <div className="detail-icon">↗</div>
                <h2>Select a user</h2>
                <p>Click an account to view listings, pricing, purchases, spend and activity.</p>
              </div>
            ) : detailLoading ? (
              <div className="admin-card admin-empty"><h2>Loading activity…</h2><p>Preparing the user's marketplace profile.</p></div>
            ) : overview ? (
              <>
                <div className="admin-card profile-card">
                  <div className="profile-top">
                    <span className="profile-avatar">{overview.user.name?.charAt(0)}</span>
                    <div>
                      <span className="eyebrow dark">USER PROFILE</span>
                      <h2>{overview.user.name}</h2>
                      <p>{overview.user.email} · {overview.user.companyName}</p>
                    </div>
                  </div>
                  <div className="profile-meta">
                    <span><b>Joined</b>{new Date(overview.user.createdAt).toLocaleDateString()}</span>
                    <span><b>Status</b>{overview.user.verificationStatus}</span>
                    <span><b>Plan</b>{overview.user.subscriptionTier}</span>
                  </div>
                </div>

                <div className="detail-kpis">
                  <div className="mini-kpi"><span>Listings</span><strong>{overview.summary.listingCount}</strong><small>{overview.summary.totalListedCBM} CBM listed</small></div>
                  <div className="mini-kpi"><span>Avg. price</span><strong>{money(overview.summary.averageListingPrice)}</strong><small>per CBM</small></div>
                  <div className="mini-kpi"><span>Purchases</span><strong>{overview.summary.purchaseCount}</strong><small>{overview.summary.totalPurchasedCBM} CBM bought</small></div>
                  <div className="mini-kpi accent"><span>Total spent</span><strong>{money(overview.summary.totalSpent)}</strong><small>confirmed purchases</small></div>
                </div>

                <div className="admin-card chart-panel">
                  <div className="chart-heading">
                    <div><span className="eyebrow dark">SUPPLY</span><h3>Listing prices</h3></div>
                    <strong>{money(overview.summary.totalListedValue)}</strong>
                  </div>
                  <div className="bar-chart">
                    {overview.listings.map((item) => (
                      <div className="bar-item" key={item._id}>
                        <div className="bar-value">{money(item.pricePerCBM)}</div>
                        <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(8, (item.pricePerCBM / maxListingPrice) * 100)}%` }} /></div>
                        <span>{item.origin} → {item.destination}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card chart-panel">
                  <div className="chart-heading">
                    <div><span className="eyebrow dark">DEMAND</span><h3>Purchase spend</h3></div>
                    <strong>{money(overview.summary.totalSpent)}</strong>
                  </div>
                  {overview.purchases.length === 0 ? (
                    <p>No purchases recorded for this user.</p>
                  ) : (
                    <div className="bar-chart">
                      {overview.purchases.map((item) => (
                        <div className="bar-item" key={item._id}>
                          <div className="bar-value">{money(item.amount)}</div>
                          <div className="bar-track spend"><div className="bar-fill spend" style={{ height: `${Math.max(8, (item.amount / maxPurchase) * 100)}%` }} /></div>
                          <span>{item.listing?.origin} → {item.listing?.destination}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-card activity-list">
                  <div className="chart-heading"><div><span className="eyebrow dark">FULL DATA</span><h3>Recent activity</h3></div></div>
                  {[...overview.purchases.map((p) => ({
                    id: p._id, date: p.createdAt, title: `Bought ${p.quantityCBM} CBM`, detail: p.listing ? `${p.listing.origin} → ${p.listing.destination}` : 'Space booking', amount: -p.amount,
                  })), ...overview.listings.map((l) => ({
                    id: l._id, date: l.createdAt, title: 'Listed container space', detail: `${l.origin} → ${l.destination} · ${l.availableCBM} CBM at ${money(l.pricePerCBM)}/CBM`, amount: l.availableCBM * l.pricePerCBM,
                  }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8).map((item) => (
                    <div className="activity-row" key={item.id}>
                      <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                      <div className={item.amount < 0 ? 'spend-amount' : 'list-amount'}>{item.amount < 0 ? '-' : '+'}{money(Math.abs(item.amount))}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
