import mongoose from 'mongoose';
const bookingSchema=mongoose.Schema({
 listing:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Listing',index:true},
 buyer:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User',index:true},
 seller:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User',index:true},
 quantityCBM:{type:Number,required:true,min:0.1},
 amount:{type:Number,required:true,min:0},
 status:{type:String,enum:['pending','accepted','confirmed','cancelled','rejected'],default:'pending',index:true},
 paymentStatus:{type:String,enum:['unpaid','pending','paid','failed','refunded'],default:'unpaid'},
 paymentProvider:{type:String,enum:['razorpay','manual'],default:'razorpay'},
 paymentOrderId:{type:String,default:''},
 paymentId:{type:String,default:''},
 paymentSignature:{type:String,default:''},
 invoiceNumber:{type:String,default:''},
 sellerNote:{type:String,default:''},
 cancelledAt:{type:Date,default:null},
 confirmedAt:{type:Date,default:null}
},{timestamps:true});
bookingSchema.index({buyer:1,createdAt:-1});
bookingSchema.index({seller:1,status:1,createdAt:-1});
export default mongoose.model('Booking',bookingSchema);