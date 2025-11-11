import mongoose from 'mongoose';

const listingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    companyName: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: [true, 'Please add an origin port'],
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination port'],
    },
    availableCBM: {
      // Cubic Meters
      type: Number,
      required: [true, 'Please add available Cubic Meters (CBM)'],
    },
    availableWeightKG: {
      type: Number,
      required: [true, 'Please add available weight in KG'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Please add a departure date'],
    },
    pricePerCBM: {
      type: Number,
      required: [true, 'Please add a price per CBM'],
    },
    cargoType: {
      type: String,
      required: [true, 'Please specify allowed cargo type (e.g., General, Food-Grade)'],
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing; 
