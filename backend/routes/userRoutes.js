import express from 'express';
const router = express.Router();
import { registerUser, authUser, getPublicProfile } from '../controllers/userController.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/:id', getPublicProfile);

export default router; 
