import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  { icon: '▥', title: 'Real-time Availability', text: 'Discover available container space across major shipping routes.' },
  { icon: '◇', title: 'Competitive Pricing', text: 'Compare space and prices to make smarter shipping decisions.' },
  { icon: '▥', title: 'Data-driven Insights', text: 'Use marketplace analytics to understand activity and capacity.' },
  { icon: '✓', title: 'Connected Shipping', text: 'Connect with space providers and manage your bookings in one place.' },
];

const steps = [
  { number: '01', title: 'Search', text: 'Find available container space on your preferred route.' },
  { number: '02', title: 'Compare', text: 'Compare routes, capacity, departure dates and prices.' },
  { number: '03', title: 'Request', text: 'Send a booking request to the space provider.' },
  { number: '04', title: 'Coordinate', text: 'Message the seller and keep your booking details together.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [activeTool, setActiveTool] = useState('search');

  const submitSearch = event => {
    event.preventDefault();
    const query = new URLSearchParams();
    if (origin.trim()) query.set('origin', origin.trim());
    if (destination.trim()) query.set('destination', destination.trim());
    if (cargoType) query.set('cargoType', cargoType);
    navigate('/find-space' + (query.toString() ? '?' + query.toString() : ''));
  };

  return (
    <div className="home-experience">
      <section className="home-hero">
        <div className="home-hero-backdrop" aria-hidden="true" />
        <div className="home-hero-content">
          <span className="home-kicker"><span className="home-live-dot" /> THE CONTAINER SPACE MARKETPLACE</span>
          <h1>Find Container Space,<br /><span>Ship Smarter.</span></h1>
          <p className="home-hero-subtitle">Make better use of shipping capacity with a marketplace built to connect space providers and businesses.</p>

          <div className="home-tool-tabs" role="tablist" aria-label="Marketplace tools">
            <button type="button" className={activeTool === 'search' ? 'active' : ''} onClick={() => setActiveTool('search')}>▣ <span>Search Space</span></button>
            <button type="button" className={activeTool === 'track' ? 'active' : ''} onClick={() => { setActiveTool('track'); navigate('/dashboard'); }}>⇢ <span>My Bookings</span></button>
            <button type="button" className={activeTool === 'analytics' ? 'active' : ''} onClick={() => { setActiveTool('analytics'); navigate('/analytics'); }}>▥ <span>View Analytics</span></button>
          </div>

          <form className="home-search-panel" onSubmit={submitSearch}>
            <label className="home-search-field"><span>ORIGIN PORT</span><div className="home-input-wrap"><span aria-hidden="true">⌖</span><input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Shanghai" aria-label="Origin port" /></div></label>
            <label className="home-search-field"><span>DESTINATION</span><div className="home-input-wrap"><span aria-hidden="true">⌖</span><input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Rotterdam" aria-label="Destination port" /></div></label>
            <label className="home-search-field home-cargo-field"><span>CARGO TYPE</span><div className="home-input-wrap"><span aria-hidden="true">▤</span><select value={cargoType} onChange={e => setCargoType(e.target.value)} aria-label="Cargo type"><option value="">Any cargo</option><option value="General">General cargo</option><option value="Refrigerated">Refrigerated</option><option value="Hazardous">Hazardous</option><option value="Dry">Dry goods</option></select></div></label>
            <button className="home-search-submit" type="submit"><span>⌕</span> Search Space</button>
          </form>
          <div className="home-hero-foot"><span><i /> Built for smarter capacity sharing</span><span>Discover space. Connect. Ship.</span></div>
        </div>
        <div className="home-orbit orbit-one" aria-hidden="true" /><div className="home-orbit orbit-two" aria-hidden="true" />
      </section>

      <section className="home-feature-grid" aria-label="Marketplace benefits">
        {features.map((feature, index) => <article className="home-feature-card" key={feature.title}>
          <div className={'home-feature-icon icon-' + index}>{feature.icon}</div>
          <div><h2>{feature.title}</h2><p>{feature.text}</p></div>
        </article>)}
      </section>

      <section className="home-how-section">
        <div className="home-section-heading"><span className="home-kicker">A CLEARER WAY TO SHIP</span><h2>How <span>ShipSpace</span> Works</h2><p>From finding capacity to coordinating a booking, everything starts in one place.</p></div>
        <div className="home-steps">
          {steps.map((step, index) => <article className="home-step" key={step.number}>
            <div className="home-step-number">{step.number}</div>
            <div className="home-step-copy"><h3>{step.title}</h3><p>{step.text}</p></div>
            {index < steps.length - 1 && <div className="home-step-connector" aria-hidden="true" />}
          </article>)}
        </div>
      </section>

      <section className="home-bottom-cta">
        <div><span className="home-kicker">READY TO MAKE SPACE COUNT?</span><h2>Your next shipment starts here.</h2><p>Explore available routes or publish unused capacity for other businesses.</p></div>
        <div className="home-cta-actions"><Link to="/find-space" className="home-search-submit">Explore Marketplace ↗</Link><Link to="/create-listing" className="home-secondary-action">List Your Space</Link></div>
      </section>
    </div>
  );
}
