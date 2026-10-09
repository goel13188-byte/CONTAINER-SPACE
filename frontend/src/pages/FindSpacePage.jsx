import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const defaults = { origin:'', destination:'', cargoType:'', from:'', to:'', minCBM:'', maxPrice:'', sort:'soonest' };
export default function FindSpacePage() {
  const [listings,setListings] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [filters,setFilters] = useState(defaults);
  const set = (key,value) => setFilters(old => ({...old,[key]:value}));
  useEffect(() => {
    let active=true;
    api.get('/listings').then(({data})=>{if(active)setListings(Array.isArray(data)?data:[]);})
      .catch(()=>{if(active)setError('Could not load listings. Please refresh and try again.');})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  const cargoTypes = [...new Set(listings.map(x=>x.cargoType).filter(Boolean))].sort();
  const results = useMemo(()=>{
    const lower = v=>String(v||'').trim().toLowerCase();
    return listings.filter(item=>{
      const date=new Date(item.departureDate);
      return lower(item.origin).includes(lower(filters.origin)) &&
        lower(item.destination).includes(lower(filters.destination)) &&
        (!filters.cargoType || lower(item.cargoType)===lower(filters.cargoType)) &&
        (!filters.from || date>=new Date(filters.from+'T00:00:00')) &&
        (!filters.to || date<=new Date(filters.to+'T23:59:59')) &&
        (!filters.minCBM || Number(item.availableCBM)>=Number(filters.minCBM)) &&
        (!filters.maxPrice || Number(item.pricePerCBM)<=Number(filters.maxPrice));
    }).sort((a,b)=>{
      if(filters.sort==='price-low')return Number(a.pricePerCBM)-Number(b.pricePerCBM);
      if(filters.sort==='price-high')return Number(b.pricePerCBM)-Number(a.pricePerCBM);
      if(filters.sort==='capacity')return Number(b.availableCBM)-Number(a.availableCBM);
      if(filters.sort==='newest')return new Date(b.createdAt||0)-new Date(a.createdAt||0);
      return new Date(a.departureDate||0)-new Date(b.departureDate||0);
    });
  },[listings,filters]);
  return <div className="marketplace-page">
    <section className="hero-section marketplace-hero"><span className="eyebrow">SHIPSPACE MARKETPLACE</span><h1>Find the right space for your shipment.</h1><p>Compare routes, capacity, cargo types and prices.</p>
      <div className="search-bar advanced-search"><input aria-label="Origin port" placeholder="Origin port" value={filters.origin} onChange={e=>set('origin',e.target.value)}/><input aria-label="Destination port" placeholder="Destination port" value={filters.destination} onChange={e=>set('destination',e.target.value)}/></div>
    </section>
    <section className="filters-panel glass-panel"><div className="filters-heading"><div><span className="eyebrow">REFINE RESULTS</span><h2>Advanced filters</h2></div><button className="btn btn-outline" onClick={()=>setFilters(defaults)}>Clear filters</button></div>
      <div className="filter-grid">
        <label>Cargo type<select value={filters.cargoType} onChange={e=>set('cargoType',e.target.value)}><option value="">All cargo types</option>{cargoTypes.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Departure from<input type="date" value={filters.from} onChange={e=>set('from',e.target.value)}/></label>
        <label>Departure to<input type="date" min={filters.from||undefined} value={filters.to} onChange={e=>set('to',e.target.value)}/></label>
        <label>Minimum capacity (CBM)<input type="number" min="0" placeholder="e.g. 5" value={filters.minCBM} onChange={e=>set('minCBM',e.target.value)}/></label>
        <label>Maximum price per CBM ($)<input type="number" min="0" placeholder="e.g. 250" value={filters.maxPrice} onChange={e=>set('maxPrice',e.target.value)}/></label>
        <label>Sort by<select value={filters.sort} onChange={e=>set('sort',e.target.value)}><option value="soonest">Soonest departure</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="capacity">Largest capacity</option><option value="newest">Recently listed</option></select></label>
      </div>
    </section>
    <div className="listing-results-meta"><strong>{results.length}</strong> matching spaces <span>•</span> {listings.length} total listings</div>
    {loading&&<p>Loading marketplace listings…</p>}{error&&<p className="message-error">{error}</p>}
    {!loading&&!error&&!results.length&&<div className="marketplace-state glass-panel"><h2>No matching spaces</h2><p>Try changing your filters.</p></div>}
    <div className="listings-grid">{!loading&&results.map(item=><ListingCard key={item._id} listing={item}/>)}</div>
  </div>;
}