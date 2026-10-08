import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setMessage('User role updated.');
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update role.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <span className="eyebrow">ADMIN CONSOLE</span>
          <h1>ShipSpace User Management</h1>
          <p>View registered accounts, verification status, subscription tier and roles.</p>
        </div>
        <div className="admin-stat">
          <strong>{users.length}</strong>
          <span>Registered users</span>
        </div>
      </div>

      <div className="admin-notice">
        <strong>Security:</strong> passwords are intentionally never displayed. They are stored as secure hashes.
        For your demo accounts, use the password configured in the Render <code>DEMO_USER_PASSWORD</code> variable.
      </div>

      {message && <div className="message-success">{message}</div>}
      {error && <div className="message-error">{error}</div>}

      {loading ? (
        <div className="admin-card">Loading users...</div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Login</th>
                <th>Company</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Plan</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account._id}>
                  <td><strong>{account.name}</strong></td>
                  <td>{account.email}</td>
                  <td>{account.companyName}</td>
                  <td><span className={`role-pill ${account.role}`}>{account.role}</span></td>
                  <td>{account.verificationStatus}</td>
                  <td>{account.subscriptionTier}</td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td>
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
        </div>
      )}
    </div>
  );
};

export default AdminPage;
