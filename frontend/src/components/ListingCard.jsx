import React from 'react';

const ListingCard = ({ listing }) => {
  return (
    <div className="listing-card">
      <div className="card-header">
        <h3>
          {listing.origin} ➔ {listing.destination}
        </h3>
        <span className="price">${listing.pricePerCBM}/CBM</span>
      </div>
      <div className="card-body">
        <p>
          <strong>By:</strong> {listing.companyName}
        </p>
        <p>
          <strong>Departs:</strong>{' '}
          {new Date(listing.departureDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Space:</strong> {listing.availableCBM} CBM /{' '}
          {listing.availableWeightKG} kg
        </p>
        <p>
          <strong>Cargo:</strong> {listing.cargoType}
        </p>
      </div>
      <div className="card-footer">
        <button className="btn">Book Space</button>
      </div>
    </div>
  );
};

export default ListingCard;