import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="pricing-container">
      <div className="pricing-toggle">
        <button
          className={`btn-toggle ${!isAnnual ? 'active' : ''}`}
          onClick={() => setIsAnnual(false)}
        >
          Monthly
        </button>
        <button
          className={`btn-toggle ${isAnnual ? 'active' : ''}`}
          onClick={() => setIsAnnual(true)}
        >
          Annual (save 2 months)
        </button>
      </div>

      <div className="pricing-grid">
        {/* Basic Plan */}
        <div className="pricing-card">
          <h2>Basic</h2>
          <p className="pricing-price">
            {isAnnual ? '$2900' : '$290'}
            <span>{isAnnual ? '/yr' : '/mo'}</span>
          </p>
          <ul className="pricing-features">
            <li>List up to 5 containers</li>
            <li>Standard support</li>
            <li>Basic analytics</li>
          </ul>
          <Link to="#" className="btn btn-outline">
            Choose Basic
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="pricing-card featured">
          <span className="featured-badge">Pro</span>
          <h2>{isAnnual ? '$7900' : '$790'}<span>{isAnnual ? '/yr' : '/mo'}</span></h2>
          <ul className="pricing-features">
            <li>Unlimited listings</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>KYC verification</li>
          </ul>
          <Link to="#" className="btn">
            Choose Pro
          </Link>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <h2>Enterprise</h2>
          <p className="pricing-price">
            Contact us
          </p> {/* --- FIX: Was </H2> --- */}
          <ul className="pricing-features">
            <li>Custom SLAs</li>
            <li>Dedicated manager</li>
            <li>SAML SSO</li>
            <li>Custom integrations</li>
          </ul>
          <Link to="#" className="btn btn-outline">
            Choose Enterprise
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;