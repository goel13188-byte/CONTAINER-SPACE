import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../state/AuthContext';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/listings/${id}`)
      .then(({ data }) => { if (active) setListing(data); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || 'Could not load this listing.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const sellerId = listing?.user?._id || listing?.user;
  const isOwner = user && String(sellerId) === String(user._id);
  const total = Number(listing?.pricePerCBM || 0) * Number(quantity || 0);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (isOwner) { setMessage('You cannot book your own listing.'); return; }
    if (quantity < 1 || quantity > listing.availableCBM) {
      setMessage(`Choose a quantity between 1 and ${listing.availableCBM} CBM.`);
      return;
    }
    try {
      setBooking(true);
      setMessage('');
      await api.post('/bookings', { listingId: listing._id, quantityCBM: Number(quantity) });
      setMessage('Booking request submitted successfully.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Unable to book this space.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <section className="listing-details-state"><p>Loading listing details…</p></section>;
  if (error || !listing) return (
    <section className="listing-details-state">
      <h1>Listing unavailable</h1>
      <p>{error || 'This listing may have been removed.'}</p>
      <Link className="btn" to="/find-space">Back to Find Space</Link>
    </section>
  );

  const seller = listing.user && typeof listing.user === 'object' ? listing.user : null;
  return (
    <section className="listing-details-page">
      <Link className="back-link" to="/find-space">← Back to all spaces</Link>
      <div className="listing-details-hero glass-panel">
        <span className="eyebrow">CONTAINER SPACE LISTING</span>
        <h1>{listing.origin} <span className="route-arrow">→</span> {listing.destination}</h1>
        <p>Available capacity for your next shipment. Review the route and listing terms before booking.</p>
        <div className="details-price">${Number(listing.pricePerCBM).toLocaleString()} <span>/ CBM</span></div>
      </div>

      <div className="listing-details-layout">
        <div className="details-main-column">
          <article className="details-panel glass-panel">
            <h2>Shipment details</h2>
            <div className="details-data-grid">
              <div><span>Origin port</span><strong>{listing.origin}</strong></div>
              <div><span>Destination port</span><strong>{listing.destination}</strong></div>
              <div><span>Departure date</span><strong>{new Date(listing.departureDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
              <div><span>Cargo type</span><strong>{listing.cargoType || 'General'}</strong></div>
              <div><span>Available volume</span><strong>{listing.availableCBM} CBM</strong></div>
              <div><span>Available weight</span><strong>{Number(listing.availableWeightKG).toLocaleString()} kg</strong></div>
            </div>
          </article>

          <article className="details-panel glass-panel">
            <h2>Seller / company</h2>
            <div className="seller-profile-row">
              <div className="seller-avatar">{(listing.companyName || 'S').slice(0, 1).toUpperCase()}</div>
              <div>
                <h3>{listing.companyName || seller?.companyName || 'Shipping company'}</h3>
                <p>{seller?.name ? `Listed by ${seller.name}` : 'Marketplace seller'}</p>
                {seller?.verificationStatus === 'verified' && <span className="verified-label">✓ Verified account</span>}
              </div>
            </div>
            <p className="seller-note">Seller information is limited to the public profile details currently available on ShipSpace.</p>
          </article>
        </div>

        <aside className="booking-panel glass-panel">
          <span className="eyebrow">BOOK THIS SPACE</span>
          <h2>Reserve capacity</h2>
          <label htmlFor="booking-quantity">Quantity (CBM)</label>
          <input id="booking-quantity" type="number" min="1" max={listing.availableCBM} step="1" value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setMessage(''); }} />
          <div className="booking-total-row"><span>Price per CBM</span><strong>${Number(listing.pricePerCBM).toLocaleString()}</strong></div>
          <div className="booking-total-row booking-total"><span>Estimated total</span><strong>${total.toLocaleString()}</strong></div>
          <p className="booking-disclaimer">This estimate uses the listed price and quantity. Confirm any additional freight charges with the seller.</p>
          <button className="btn booking-submit" onClick={handleBook} disabled={booking || isOwner}>
            {booking ? 'Submitting…' : isOwner ? 'Your listing' : user ? 'Request booking' : 'Log in to book'}
          </button>
          {message && <p className={message.includes('successfully') ? 'message-success booking-feedback' : 'message-error booking-feedback'}>{message}</p>}
        </aside>
      </div>
    </section>
  );
};

export default ListingDetailsPage;
