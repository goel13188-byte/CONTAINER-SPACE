import express from 'express';
import { protect, adminOnly } from '../middleware/adminMiddleware.js';
import { listUsers, getUserOverview, updateRole } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', listUsers);
router.get('/users/:id/overview', getUserOverview);
router.patch('/users/:id/role', updateRole);

export default router;
