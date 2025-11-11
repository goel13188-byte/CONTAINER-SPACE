import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const FindSpacePage = () => {
  const [listings, setListings] = useState([]); // Holds all listings from DB
  const [filteredListings, setFilteredListings] = useState([]); // Holds search results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the search inputs
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/listings');
        setListings(data); // Store the master list
        setFilteredListings(data); // Initially, show all listings
        setLoading(false);
      } catch (err) {
        setError('Failed to load listings.');
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Function to handle the search logic
  const handleSearch = (e) => {
    e.preventDefault(); // Stop the form from reloading the page

    // Filter the master list based on search queries
    const results = listings.filter((listing) => {
      const originMatch = listing.origin
        .toLowerCase()
        .includes(originQuery.toLowerCase());
      const destinationMatch = listing.destination
        .toLowerCase()
        .includes(destinationQuery.toLowerCase());
      
      // Return true only if both (or one, if the other is empty) match
      return originMatch && destinationMatch;
    });

    setFilteredListings(results);
  };

  return (
    <div>
      <div className="hero-section" style={{ padding: '2rem 0' }}>
        <h1>Find Available Space</h1>
        <p>Browse all active listings on the marketplace.</p>

        {/* Updated search bar form */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Origin (e.g., Shanghai)"
            value={originQuery}
            onChange={(e) => setOriginQuery(e.target.value)}
          />
          <input
            type="text"
            placeholder="Destination (e.g., Rotterdam)"
            value={destinationQuery}
            onChange={(e) => setDestinationQuery(e.target.value)}
          />
          <button type="submit" className="btn">
            Find Space
          </button>
        </form>
      </div>

      {loading && <p>Loading listings...</p>}
      {error && <p className="message-error">{error}</p>}

      <div className="listings-grid">
        {!loading && filteredListings.length === 0 && (
          <p style={{ textAlign: 'center', width: '100%' }}>
            No listings found matching your search.
          </p>
        )}
        {/* Map over filteredListings instead of listings */}
        {filteredListings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default FindSpacePage;