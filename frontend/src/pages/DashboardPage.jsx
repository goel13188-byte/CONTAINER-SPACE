import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../state/AuthContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/listings/mylistings');
      setMyListings(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your listings.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${id}`);
        setMessage('Listing deleted successfully.');
        // Refresh the list
        fetchMyListings();
      } catch (err) {
        setError('Failed to delete listing.');
      }
    }
  };


  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Manage your listings and bookings from here.</p>
        <Link to="/create-listing" className="btn">
          + List New Space
        </Link>
      </div>

      <div className="dashboard-my-listings">
        <h2>My Listings</h2>
        {error && <p className="message-error">{error}</p>}
        {message && <p className="message-success">{message}</p>}
        {loading && <p>Loading your listings...</p>}
        
        {!loading && myListings.length === 0 && (
          <p>You have not created any listings yet.</p>
        )}

        {myListings.length > 0 && (
          <table className="listings-table">
            <thead>
              <tr>
                <th>Origin</th>
                <th>Destination</th>
                <th>Date</th>
                <th>Space</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myListings.map((listing) => (
                <tr key={listing._id}>
                  <td>{listing.origin}</td>
                  <td>{listing.destination}</td>
                  <td>{new Date(listing.departureDate).toLocaleDateString()}</td>
                  <td>{listing.availableCBM} CBM</td>
                  <td>${listing.pricePerCBM}/CBM</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(listing._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;