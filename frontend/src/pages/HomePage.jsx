import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="hero-section">
      <h1>Turn Your Empty Container Space into Profit</h1>
      <p>
        The world's first P2P marketplace for post-booking container space.
        Find space, or list your own.
      </p>

      <form className="search-bar">
        <input type="text" placeholder="Origin (e.g., Shanghai)" />
        <input type="text" placeholder="Destination (e.g., Rotterdam)" />
        <Link to="/find-space" className="btn">
          Find Space
        </Link>
      </form>
    </div>
  );
};

export default HomePage;