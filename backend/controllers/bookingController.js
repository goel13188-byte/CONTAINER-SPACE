import crypto from 'crypto';
import Booking from '../models/bookingModel.js';
import Listing from '../models/listingModel.js';
import Notification from '../models/notificationModel.js';

const populateBooking=booking=>booking.populate([
 {path:'listing',select:'origin destination pricePerCBM companyName departureDate availableCBM availableWeightKG'},
 {path:'buyer',select:'name email companyName'},
 {path:'seller',select:'name email companyName'}
]);
const createBooking=async(req,res)=>{
 try{
  const {listingId,quantityCBM=1}=req.body;const quantity=Number(quantityCBM);
  if(!listingId||!/^[0-9a-fA-F]{24}$/.test(listingId)||!Number.isFinite(quantity)||quantity<=0||quantity>100000)return res.status(400).json({message:'Enter a valid listing and quantity.'});
  const listing=await Listing.findById(listingId);
  if(!listing)return res.status(404).json({message:'Listing not found.'});
  if(String(listing.user)===String(req.user._id))return res.status(400).json({message:'You cannot book your own listing.'});
  if(quantity>Number(listing.availableCBM))return res.status(400).json({message:'Requested space exceeds current available CBM.'});
  const booking=await Booking.create({listing:listing._id,buyer:req.user._id,seller:listing.user,quantityCBM:quantity,amount:Number((quantity*listing.pricePerCBM).toFixed(2)),status:'pending',paymentStatus:'unpaid'});
  await Notification.create({user:listing.user,type:'booking_request',title:'New booking request',body:req.user.companyName+' requested '+quantity+' CBM for '+listing.origin+' → '+listing.destination+'.',link:'/dashboard',relatedBooking:booking._id});
  res.status(201).json(await populateBooking(booking));
 }catch(e){console.error('Booking request error:',e.message);res.status(500).json({message:'Unable to submit booking request.'});}
};
const getMyBookings=async(req,res)=>{
 try{const bookings=await Booking.find({buyer:req.user._id}).populate('listing','origin destination pricePerCBM companyName departureDate').populate('seller','name companyName').sort({createdAt:-1});res.json(bookings);}
 catch(e){console.error('Buyer bookings error:',e.message);res.status(500).json({message:'Unable to load bookings.'});}
};
const getSellerBookings=async(req,res)=>{
 try{const bookings=await Booking.find({seller:req.user._id}).populate('listing','origin destination pricePerCBM companyName departureDate availableCBM').populate('buyer','name companyName email').sort({createdAt:-1});res.json(bookings);}
 catch(e){console.error('Seller bookings error:',e.message);res.status(500).json({message:'Unable to load incoming booking requests.'});}
};
const updateBookingStatus=async(req,res)=>{
 try{
  const {status,sellerNote=''}=req.body;
  if(!['accepted','rejected','cancelled'].includes(status))return res.status(400).json({message:'Invalid booking status change.'});
  const booking=await Booking.findById(req.params.id);
  if(!booking)return res.status(404).json({message:'Booking not found.'});
  const isSeller=String(booking.seller)===String(req.user._id);
  const isBuyer=String(booking.buyer)===String(req.user._id);
  if(!isSeller&&!isBuyer)return res.status(403).json({message:'You cannot update this booking.'});
  if(status==='cancelled'){
   if(!isBuyer)return res.status(403).json({message:'Only the buyer can request cancellation.'});
   if(!['pending','accepted'].includes(booking.status)||booking.paymentStatus==='paid')return res.status(400).json({message:'This booking cannot be cancelled here. Contact support for paid or confirmed bookings.'});
  }else{
   if(!isSeller)return res.status(403).json({message:'Only the seller can respond to a request.'});
   if(booking.status!=='pending')return res.status(400).json({message:'Only pending requests can be accepted or rejected.'});
  }
  if(status==='accepted'){
   const listing=await Listing.findOneAndUpdate({_id:booking.listing, user:booking.seller, availableCBM:{$gte:booking.quantityCBM}},{$inc:{availableCBM:-booking.quantityCBM}},{new:true});
   if(!listing)return res.status(409).json({message:'There is not enough unreserved capacity left. Refresh the listing and contact the buyer.'});
   booking.status='accepted';booking.sellerNote=String(sellerNote).slice(0,500);
   await booking.save();
   await Notification.create({user:booking.buyer,type:'booking_accepted',title:'Booking accepted',body:'Your request was accepted. Complete payment to confirm the reservation.',link:'/dashboard',relatedBooking:booking._id});
  }else{
   booking.status=status;booking.sellerNote=String(sellerNote).slice(0,500);
   if(status==='cancelled')booking.cancelledAt=new Date();
   await booking.save();
   if(status==='rejected')await Notification.create({user:booking.buyer,type:'booking_rejected',title:'Booking request declined',body:'The seller declined your booking request.',link:'/dashboard',relatedBooking:booking._id});
   if(status==='cancelled')await Notification.create({user:booking.seller,type:'booking_cancelled',title:'Booking request cancelled',body:'The buyer cancelled a booking request.',link:'/dashboard',relatedBooking:booking._id});
  }
  res.json(await populateBooking(booking));
 }catch(e){console.error('Booking status update error:',e.message);res.status(500).json({message:'Unable to update booking.'});}
};
const createPaymentOrder=async(req,res)=>{
 if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({message:'Online payments are not configured yet. The site owner must add Razorpay test keys to Render before checkout can be enabled.'});
 return res.status(501).json({message:'Payment gateway SDK and order verification must be configured before accepting money. No payment has been taken.'});
};
const verifyPayment=async(req,res)=>res.status(503).json({message:'Payment verification is not configured. Do not transfer money manually through this page.'});
const getInvoice=async(req,res)=>{
 try{
  const booking=await Booking.findById(req.params.id).populate('listing','origin destination pricePerCBM companyName departureDate').populate('buyer','name email companyName').populate('seller','name email companyName');
  if(!booking)return res.status(404).json({message:'Booking not found.'});
  if(![String(booking.buyer?._id),String(booking.seller?._id)].includes(String(req.user._id)))return res.status(403).json({message:'You cannot view this invoice.'});
  if(booking.paymentStatus!=='paid')return res.status(400).json({message:'Invoice is available after successful payment.'});
  if(!booking.invoiceNumber){booking.invoiceNumber='SS-'+booking.createdAt.getFullYear()+'-'+booking._id.toString().slice(-8).toUpperCase();await booking.save();}
  res.json({invoiceNumber:booking.invoiceNumber,issuedAt:booking.updatedAt,booking});
 }catch(e){console.error('Invoice error:',e.message);res.status(500).json({message:'Unable to create invoice.'});}
};
export {createBooking,getMyBookings,getSellerBookings,updateBookingStatus,createPaymentOrder,verifyPayment,getInvoice};