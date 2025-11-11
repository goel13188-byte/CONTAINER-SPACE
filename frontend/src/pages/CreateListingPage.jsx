import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateListingPage = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableCBM, setAvailableCBM] = useState('');
  const [availableWeightKG, setAvailableWeightKG] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [pricePerCBM, setPricePerCBM] = useState('');
  const [cargoType, setCargoType] = useState('General');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const listingData = {
        origin,
        destination,
        availableCBM: Number(availableCBM),
        availableWeightKG: Number(availableWeightKG),
        departureDate,
        pricePerCBM: Number(pricePerCBM),
        cargoType,
      };

      await api.post('/listings', listingData);

      setMessage('Listing created successfully!');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create listing. Check all fields.'
      );
    }
  };

  return (
    <div>
      <h1>List Your Unused Space</h1>
      <p>Fill out the details below to put your empty space on the marketplace.</p>

      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      <form onSubmit={submitHandler}>
        <div>
          <label>Origin Port</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
            placeholder="e.g., Shanghai"
          />
        </div>
        <div>
          <label>Destination Port</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="e.g., Rotterdam"
          />
        </div>
        <div>
          <label>Departure Date</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Available Space (CBM)</label>
          <input
            type="number"
            value={availableCBM}
            onChange={(e) => setAvailableCBM(e.target.value)}
            required
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <label>Available Weight (KG)</label>
          <input
            type="number"
            value={availableWeightKG}
            onChange={(e) => setAvailableWeightKG(e.target.value)}
            required
            placeholder="e.g., 2000"
          />
        </div>
        <div>
          <label>Price per CBM ($)</label>
          <input
            type="number"
            value={pricePerCBM}
            onChange={(e) => setPricePerCBM(e.target.value)}
            required
            placeholder="e.g., 150"
          />
        </div>
        <div>
          <label>Allowed Cargo Type</label>
          <input
            type="text"
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;