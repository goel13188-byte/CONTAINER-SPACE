import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import Listing from '../models/listingModel.js';
import Review from '../models/reviewModel.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      companyName,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Unable to register user.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Unable to log in.' });
  }
};

const getPublicProfile = async (req,res) => {
 try {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return res.status(400).json({message:'Invalid company profile ID.'});
  const user=await User.findById(req.params.id).select('name companyName verificationStatus subscriptionTier createdAt');
  if(!user)return res.status(404).json({message:'Company not found.'});
  const [listings,reviews]=await Promise.all([
   Listing.find({user:user._id}).sort({createdAt:-1}).select('origin destination availableCBM availableWeightKG departureDate pricePerCBM cargoType createdAt'),
   Review.find({seller:user._id}).populate('reviewer','name companyName').sort({createdAt:-1}).limit(20)
  ]);
  const ratings=await Review.find({seller:user._id}).select('rating');
  const averageRating=ratings.length?Number((ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1)):null;
  res.json({user,listings,reviews,reviewCount:ratings.length,averageRating});
 } catch(e){console.error('Public profile error:',e.message);res.status(500).json({message:'Unable to load company profile.'});}
};
export { registerUser, authUser, getPublicProfile };
