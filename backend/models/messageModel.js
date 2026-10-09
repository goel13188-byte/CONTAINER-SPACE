import mongoose from 'mongoose';
const messageSchema=mongoose.Schema({
 booking:{type:mongoose.Schema.Types.ObjectId,ref:'Booking',required:true,index:true},
 sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 recipient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
 body:{type:String,required:true,trim:true,maxlength:3000},
 readAt:{type:Date,default:null}
},{timestamps:true});
messageSchema.index({booking:1,createdAt:1});
export default mongoose.model('Message',messageSchema);