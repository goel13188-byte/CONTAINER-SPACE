import express from 'express';
import {listMessages,sendMessage,unreadMessages} from '../controllers/messageController.js';
import {protect} from '../middleware/authMiddleware.js';
const router=express.Router();router.use(protect);router.get('/unread-count',unreadMessages);router.get('/:bookingId',listMessages);router.post('/:bookingId',sendMessage);export default router;