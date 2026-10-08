import express from 'express';
import { protect, adminOnly } from '../middleware/adminMiddleware.js';
import { listUsers, updateRole } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/users', listUsers);
router.patch('/users/:id/role', updateRole);

export default router;
