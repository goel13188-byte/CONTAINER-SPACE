import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';

const getAnalyticsStats = async (req,res) => {
 try {
  const userId=req.user._id;
  const [listings, bookings, purchases] = await Promise.all([
   Listing.find({user:userId}).select('origin destination availableCBM pricePerCBM createdAt departureDate'),
   Booking.find({buyer:userId}).populate({path:'listing',select:'user origin destination availableCBM pricePerCBM'}).sort({createdAt:1}),
   Booking.find({status:{$ne:'cancelled'}}).populate({path:'listing',select:'user origin destination availableCBM pricePerCBM'}).sort({createdAt:1})
  ]);
  const ownedBookings=purchases.filter(b=>b.listing&&String(b.listing.user)===String(userId));
  const now=new Date();const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-30);
  const earnings30d=ownedBookings.filter(b=>new Date(b.createdAt)>=cutoff&&b.status==='confirmed').reduce((s,b)=>s+Number(b.amount||0),0);
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const earningsData=[];
  for(let offset=5;offset>=0;offset--){
   const start=new Date(now.getFullYear(),now.getMonth()-offset,1);
   const end=new Date(now.getFullYear(),now.getMonth()-offset+1,1);
   const value=ownedBookings.filter(b=>b.status==='confirmed'&&new Date(b.createdAt)>=start&&new Date(b.createdAt)<end).reduce((s,b)=>s+Number(b.amount||0),0);
   earningsData.push({name:monthNames[start.getMonth()],Earnings:Number(value.toFixed(2))});
  }
  const utilizationData=listings.slice(0,8).map(item=>{
   const booked=ownedBookings.filter(b=>b.listing&&String(b.listing._id)===String(item._id)&&b.status!=='cancelled').reduce((s,b)=>s+Number(b.quantityCBM||0),0);
   const total=Number(item.availableCBM||0)+booked;
   return {name:item.origin+' → '+item.destination,Utilization:total>0?Math.min(100,Math.round(booked/total*100)):0};
  });
  const myBookingsCount=bookings.filter(b=>b.status!=='cancelled').length;
  const carbonSavings=Number((bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+Number(b.quantityCBM||0),0)*0.015).toFixed(2));
  const totalListedCBM=listings.reduce((s,l)=>s+Number(l.availableCBM||0),0);
  const totalListedValue=listings.reduce((s,l)=>s+Number(l.availableCBM||0)*Number(l.pricePerCBM||0),0);
  res.json({myContainerCount:listings.length,myBookingsCount,earnings30d:Number(earnings30d.toFixed(2)),carbonSavings,earningsData,utilizationData,totalListedCBM,totalListedValue,totalBookingValue:bookings.reduce((s,b)=>s+Number(b.amount||0),0),hasListingData:listings.length>0});
 } catch(error){console.error('Analytics error:',error.message);res.status(500).json({message:'Unable to calculate analytics right now.'});}
};
export {getAnalyticsStats};