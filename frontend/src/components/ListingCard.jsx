import React, { useContext, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import AuthContext from '../state/AuthContext';

const ListingCard = ({ listing }) => {
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  const handleBook = async () => {
    if (!user) { setMessage('Please log in to book space.'); return; }
    if (String(listing.user?._id || listing.user) === String(user._id)) { setMessage('You cannot book your own listing.'); return; }
    try {
      setBooking(true); setMessage('');
      await api.post('/bookings', { listingId: listing._id, quantityCBM: 1 });
      setMessage('1 CBM booked successfully.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Unable to book this space.');
    } finally { setBooking(false); }
  };

  return (
    <article className="listing-card">
      <div className="listing-accent" />
      <div className="card-header">
        <div><span className="route-label">AVAILABLE ROUTE</span><h3>{listing.origin} <span>→</span> {listing.destination}</h3></div>
        <span className="price">${listing.pricePerCBM}<small>/CBM</small></span>
      </div>
      <div className="card-body">
        <p><strong>Company</strong><span>{listing.companyName}</span></p>
        <p><strong>Departure</strong><span>{new Date(listing.departureDate).toLocaleDateString()}</span></p>
        <p><strong>Space</strong><span>{listing.availableCBM} CBM · {listing.availableWeightKG.toLocaleString()} kg</span></p>
        <p><strong>Cargo</strong><span className="cargo-badge">{listing.cargoType}</span></p>
      </div>
      <div className="card-footer">
        <Link className="btn btn-outline listing-details-link" to={`/listing/${listing._id}`}>View details</Link><Link className="seller-profile-link" to={`/company/${listing.user?._id || listing.user}`}>Company profile ↗</Link>
        <button className="btn" onClick={handleBook} disabled={booking}>{booking ? 'Booking…' : 'Book 1 CBM'}</button>
        {message && <span className="booking-message">{message}</span>}
      </div>
    </article>
  );
};

export default ListingCard;