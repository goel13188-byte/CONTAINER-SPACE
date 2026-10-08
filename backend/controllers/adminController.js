import User from '../models/userModel.js';

// @route GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Unable to load users.' });
  }
};

// @route PATCH /api/admin/users/:id/role
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (String(req.user._id) === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Admin role update error:', error);
    res.status(500).json({ message: 'Unable to update role.' });
  }
};

// @route PATCH /api/admin/users/:id/reset-password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ message: 'Unable to reset password.' });
  }
};

export { listUsers, updateRole, resetPassword };
