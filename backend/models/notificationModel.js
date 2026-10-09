import mongoose from 'mongoose';
const notificationSchema=mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 type:{type:String,required:true,default:'system'},
 title:{type:String,required:true,maxlength:120},
 body:{type:String,required:true,maxlength:1000},
 link:{type:String,default:'/dashboard'},
 relatedBooking:{type:mongoose.Schema.Types.ObjectId,ref:'Booking',default:null},
 readAt:{type:Date,default:null}
},{timestamps:true});
notificationSchema.index({user:1,readAt:1,createdAt:-1});
export default mongoose.model('Notification',notificationSchema);