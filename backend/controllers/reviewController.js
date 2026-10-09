import Review from '../models/reviewModel.js';
import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';
const getSellerReviews=async(req,res)=>{
 try{
  if(!/^[0-9a-fA-F]{24}$/.test(req.params.sellerId))return res.status(400).json({message:'Invalid seller ID.'});
  const reviews=await Review.find({seller:req.params.sellerId}).populate('reviewer','name companyName').sort({createdAt:-1}).limit(50);
  const ratings=await Review.find({seller:req.params.sellerId}).select('rating');
  const averageRating=ratings.length?Number((ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1)):null;
  res.json({reviews,reviewCount:ratings.length,averageRating});
 }catch(e){console.error('Review list error:',e.message);res.status(500).json({message:'Unable to load reviews.'});}
};
const createReview=async(req,res)=>{
 try{
  const {listingId,rating,comment}=req.body;const score=Number(rating);
  if(!listingId||!Number.isInteger(score)||score<1||score>5||!String(comment||'').trim())return res.status(400).json({message:'Choose a rating from 1–5 and enter a review.'});
  if(!/^[0-9a-fA-F]{24}$/.test(listingId))return res.status(400).json({message:'Invalid listing ID.'});
  const listing=await Listing.findById(listingId);if(!listing)return res.status(404).json({message:'Listing not found.'});
  if(String(listing.user)===String(req.user._id))return res.status(403).json({message:'You cannot review your own listing.'});
  const hasBooking=await Booking.exists({listing:listing._id,buyer:req.user._id,status:{$ne:'cancelled'}});
  if(!hasBooking)return res.status(403).json({message:'Only buyers who have booked this listing can review it.'});
  const review=await Review.findOneAndUpdate({listing:listing._id,reviewer:req.user._id},{$set:{seller:listing.user,rating:score,comment:String(comment).trim().slice(0,1000)}},{new:true,upsert:true,runValidators:true,setDefaultsOnInsert:true}).populate('reviewer','name companyName');
  res.status(201).json(review);
 }catch(e){console.error('Review create error:',e.message);res.status(500).json({message:'Unable to save review.'});}
};
export {getSellerReviews,createReview};