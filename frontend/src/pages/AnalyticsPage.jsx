import React,{useEffect,useState} from 'react';
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,BarChart,Bar,Cell} from 'recharts';
import {Link} from 'react-router-dom';
import api from '../services/api';

const money=v=>'$'+Number(v||0).toLocaleString(undefined,{maximumFractionDigits:0});
const CustomTooltip=({active,payload,label})=>active&&payload?.length?<div className="analytics-tooltip"><span>{label}</span><strong>{money(payload[0].value)}</strong></div>:null;
const AnalyticsPage=()=>{
 const [stats,setStats]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{let active=true;api.get('/analytics/stats').then(({data})=>{if(active)setStats(data);}).catch(e=>{if(active)setError(e?.response?.status===401?'Log in to view your private analytics.':'Could not load your analytics right now.');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 if(loading)return <div className="analytics-page"><div className="analytics-loading glass-panel"><div className="loading-orb"/>Preparing your live workspace analytics…</div></div>;
 if(error)return <div className="analytics-page"><div className="analytics-empty glass-panel"><span className="eyebrow">ANALYTICS ACCESS</span><h1>Your numbers, in focus.</h1><p>{error}</p><Link className="btn" to="/login">Log in to continue ↗</Link></div></div>;
 if(!stats)return null;
 const cards=[
  {label:'Published spaces',value:stats.myContainerCount,unit:'listings',symbol:'↗',tone:'violet'},
  {label:'Bookings made',value:stats.myBookingsCount,unit:'confirmed / active',symbol:'▦',tone:'cyan'},
  {label:'Seller earnings · 30d',value:money(stats.earnings30d),unit:'from paid bookings',symbol:'$',tone:'mint'},
  {label:'Estimated CO₂ benefit',value:Number(stats.carbonSavings||0).toFixed(2)+' t',unit:'indicative estimate',symbol:'✳',tone:'amber'}
 ];
 const hasEarnings=stats.earningsData?.some(x=>x.Earnings>0);
 return <div className="analytics-page">
  <section className="analytics-hero">
   <div className="analytics-hero-copy"><span className="eyebrow"><span className="live-dot"/> YOUR SHIPSPACE INTELLIGENCE</span><h1>See the <em>whole picture.</em></h1><p>Marketplace performance, booking activity and capacity signals — in one command view.</p><div className="analytics-hero-actions"><Link className="btn" to="/dashboard">Open workspace ↗</Link><Link className="analytics-text-link" to="/find-space">Explore marketplace <span>→</span></Link></div></div>
   <div className="analytics-orbit" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><span>SS</span><small>INTEL</small></div><span className="orbit-chip chip-one">SUPPLY</span><span className="orbit-chip chip-two">DEMAND</span><span className="orbit-chip chip-three">FLOW ↗</span></div>
   <div className="analytics-hero-foot"><span>LIVE ACCOUNT DATA</span><span>•</span><span>LAST 6 MONTHS</span><span className="hero-foot-spacer"/><span className="hero-foot-note">Your activity. Your signal.</span></div>
  </section>
  <section className="analytics-stat-grid">{cards.map((card,i)=><article key={card.label} className={'analytics-stat glass-panel '+card.tone}><div className="analytics-stat-top"><span>{card.label}</span><span className="analytics-stat-icon">{card.symbol}</span></div><strong>{card.value}</strong><div className="analytics-stat-bottom"><span>{card.unit}</span><span className="stat-sparkline" aria-hidden="true">▁▃▂▅▄▇▆</span></div><span className="stat-index">0{i+1}</span></article>)}</section>
  <section className="analytics-main-grid">
   <article className="analytics-panel glass-panel earnings-panel"><div className="analytics-panel-heading"><div><span className="eyebrow">REVENUE SIGNAL</span><h2>Seller earnings</h2><p>Paid bookings by month</p></div><span className="panel-period">6 MONTHS <span>⌄</span></span></div>
    {hasEarnings?<ResponsiveContainer width="100%" height={290}><AreaChart data={stats.earningsData} margin={{top:12,right:8,left:0,bottom:0}}><defs><linearGradient id="earningsGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={.5}/><stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(173,188,226,.1)" vertical={false}/><XAxis dataKey="name" tick={{fill:'#8e9bb7',fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#8e9bb7',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?'$'+(v/1000).toFixed(1)+'k':'$'+v} width={48}/><Tooltip content={<CustomTooltip/>}/><Area type="monotone" dataKey="Earnings" stroke="#b4a4ff" strokeWidth={3} fill="url(#earningsGlow)" activeDot={{r:5,fill:'#e9d5ff',stroke:'#7c3aed',strokeWidth:2}}/></AreaChart></ResponsiveContainer>:<div className="analytics-chart-empty"><span>↗</span><h3>Your revenue story starts here</h3><p>When a booking is paid and verified, seller earnings will appear here. Checkout is currently disabled.</p><Link to="/create-listing">Publish a space →</Link></div>}
    <div className="chart-footer-line"><span><i className="legend-dot violet-dot"/> PAID BOOKING VALUE</span><strong>{money(stats.earnings30d)} <small>last 30 days</small></strong></div>
   </article>
   <article className="analytics-panel glass-panel capacity-panel"><div className="analytics-panel-heading"><div><span className="eyebrow">CAPACITY INTELLIGENCE</span><h2>Space utilization</h2><p>Booked volume relative to listed capacity</p></div><span className="panel-glyph">◌</span></div>
    {stats.utilizationData?.length?<><div className="utilization-legend"><span><i className="legend-dot mint-dot"/> Booked share</span><span>0–100%</span></div><ResponsiveContainer width="100%" height={240}><BarChart data={stats.utilizationData} layout="vertical" margin={{top:4,right:14,left:2,bottom:0}}><CartesianGrid stroke="rgba(173,188,226,.08)" horizontal={false}/><XAxis type="number" domain={[0,100]} tickFormatter={v=>v+'%'} tick={{fill:'#8e9bb7',fontSize:11}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={105} tick={{fill:'#c4cee2',fontSize:10}} axisLine={false} tickLine={false}/><Tooltip formatter={v=>[v+'%','Utilization']} contentStyle={{background:'#11172a',border:'1px solid rgba(177,190,230,.2)',borderRadius:12,color:'#fff'}}/><Bar dataKey="Utilization" radius={[0,8,8,0]} maxBarSize={18}>{stats.utilizationData.map((entry,index)=><Cell key={entry.name} fill={['#65e6c2','#8c7cff','#59c7ef','#e8b96a'][index%4]}/>)}</Bar></BarChart></ResponsiveContainer></>:<div className="analytics-chart-empty compact"><span>▤</span><h3>No supply data yet</h3><p>Add a listing to start tracking capacity.</p><Link to="/create-listing">Create first listing →</Link></div>}
    <div className="capacity-foot"><div><span>AVAILABLE CAPACITY</span><strong>{Number(stats.totalListedCBM||0).toLocaleString()} <small>CBM</small></strong></div><div><span>LISTED VALUE</span><strong>{money(stats.totalListedValue)}</strong></div></div>
   </article>
  </section>
  <section className="analytics-bottom-grid"><article className="analytics-insight glass-panel"><span className="insight-mark">✳</span><div><span className="eyebrow">SUSTAINABILITY SIGNAL</span><h3>Make every cubic metre count.</h3><p>CO₂ benefit is an indicative estimate based on your booked volume, not a verified emissions calculation.</p></div><span className="insight-number">{Number(stats.carbonSavings||0).toFixed(2)}<small> t CO₂e*</small></span></article><article className="analytics-next glass-panel"><span className="eyebrow">NEXT BEST MOVE</span><h3>Turn unused space into opportunity.</h3><p>Keep your listings current so buyers can discover available capacity.</p><Link to="/create-listing">Add a listing <span>↗</span></Link></article></section>
  <footer className="analytics-footnote">Metrics are calculated from your current ShipSpace account data. Revenue reflects successfully paid and verified bookings recorded in the system. <span>*CO₂ benefit is a rough illustrative estimate.</span></footer>
 </div>;
};
export default AnalyticsPage;