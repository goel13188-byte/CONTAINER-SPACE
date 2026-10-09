import React,{useState,useEffect,useCallback,useContext} from 'react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../state/AuthContext';
const money=v=>'$'+Number(v||0).toLocaleString(undefined,{maximumFractionDigits:2});
export default function DashboardPage(){
 const {user}=useContext(AuthContext);
 const [myListings,setMyListings]=useState([]);
 const [bookings,setBookings]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  const results=await Promise.allSettled([api.get('/listings/mylistings'),api.get('/bookings/mine')]);
  if(results[0].status==='fulfilled')setMyListings(results[0].value.data||[]);else setError('Could not load your listings.');
  if(results[1].status==='fulfilled')setBookings(results[1].value.data||[]);else setError(old=>old?old+' Booking history unavailable.':'Booking history unavailable.');
  setLoading(false);
 },[]);
 useEffect(()=>{load();},[load]);
 const remove=async id=>{
  if(!window.confirm('Delete this listing? This cannot be undone.'))return;
  try{await api.delete('/listings/'+id);setMessage('Listing deleted.');await load();}
  catch(e){setError(e?.response?.data?.message||'Failed to delete listing.');}
 };
 const capacity=myListings.reduce((s,x)=>s+Number(x.availableCBM||0),0);
 const spend=bookings.reduce((s,x)=>s+Number(x.amount||0),0);
 return <div className="dashboard-page">
  <section className="dashboard-hero glass-panel"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Welcome back, {user?.name||'there'}.</h1><p>Manage your supply, review bookings and track marketplace activity.</p></div><Link to="/create-listing" className="btn">+ List new space</Link></section>
  {error&&<p className="message-error">{error}</p>}{message&&<p className="message-success">{message}</p>}
  <section className="dashboard-kpi-grid">
   <div className="dashboard-kpi glass-panel"><span>My listings</span><strong>{myListings.length}</strong><small>Published spaces</small></div>
   <div className="dashboard-kpi glass-panel"><span>Listed capacity</span><strong>{capacity.toLocaleString()} CBM</strong><small>Across your listings</small></div>
   <div className="dashboard-kpi glass-panel"><span>Bookings made</span><strong>{bookings.length}</strong><small>Buyer booking history</small></div>
   <div className="dashboard-kpi glass-panel"><span>Booking value</span><strong>{money(spend)}</strong><small>Combined booking value</small></div>
  </section>
  <section className="dashboard-section glass-panel"><div className="dashboard-section-heading"><div><span className="eyebrow">SUPPLY</span><h2>My listings</h2></div><span className="admin-count">{myListings.length} total</span></div>
   {loading?<p>Loading dashboard…</p>:myListings.length===0?<div className="dashboard-empty"><h3>No listings yet</h3><p>Publish your first available container space to get started.</p><Link className="btn" to="/create-listing">Create listing</Link></div>:
   <div className="admin-table-wrap"><table className="listings-table"><thead><tr><th>Route</th><th>Departure</th><th>Capacity</th><th>Price</th><th>Actions</th></tr></thead><tbody>{myListings.map(x=><tr key={x._id}><td><Link to={'/listing/'+x._id}>{x.origin} → {x.destination}</Link></td><td>{new Date(x.departureDate).toLocaleDateString()}</td><td>{x.availableCBM} CBM · {Number(x.availableWeightKG).toLocaleString()} kg</td><td>{money(x.pricePerCBM)}/CBM</td><td className="dashboard-actions"><Link className="admin-action" to={'/listing/'+x._id}>View</Link><button className="btn-delete" onClick={()=>remove(x._id)}>Delete</button></td></tr>)}</tbody></table></div>}
  </section>
  <section className="dashboard-section glass-panel"><div className="dashboard-section-heading"><div><span className="eyebrow">DEMAND</span><h2>My bookings</h2></div><span className="admin-count">{bookings.length} bookings</span></div>
   {loading?<p>Loading booking history…</p>:bookings.length===0?<div className="dashboard-empty"><h3>No bookings yet</h3><p>When you book a space, details will appear here.</p><Link className="btn btn-outline" to="/find-space">Explore spaces</Link></div>:
   <div className="admin-table-wrap"><table className="listings-table"><thead><tr><th>Route</th><th>Company</th><th>Quantity</th><th>Amount</th><th>Status</th><th>Booked</th></tr></thead><tbody>{bookings.map(x=><tr key={x._id}><td>{x.listing?<Link to={'/listing/'+x.listing._id}>{x.listing.origin} → {x.listing.destination}</Link>:'Listing unavailable'}</td><td>{x.listing?.companyName||'—'}</td><td>{x.quantityCBM} CBM</td><td>{money(x.amount)}</td><td><span className={'role-pill '+x.status}>{x.status}</span></td><td>{new Date(x.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
  </section>
 </div>;
}