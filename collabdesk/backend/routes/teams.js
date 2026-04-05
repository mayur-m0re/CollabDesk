const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');

// @route   GET /api/teams/members
// @desc    Get workspace members with presence
// @access  Private
router.get('/members', auth, async (req, res) => {
  try {
    const { workspace } = req.query;

    if (!workspace) {
      return res.status(400).json({ message: 'Workspace ID required' });
    }

    const workspaceDoc = await Workspace.findById(workspace)
      .populate('members.user', 'name email avatar status lastActive')
      .populate('owner', 'name email avatar status lastActive');

    if (!workspaceDoc) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspaceDoc.members.some(m => m.user._id.toString() === req.userId.toString()) ||
      workspaceDoc.owner._id.toString() === req.userId.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const members = workspaceDoc.members.map(m => ({
      ...m.user.toObject(),
      role: m.role,
      joinedAt: m.joinedAt
    }));

    // Add owner
    members.unshift({
      ...workspaceDoc.owner.toObject(),
      role: 'owner',
      joinedAt: workspaceDoc.createdAt
    });

    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teams/online
// @desc    Get online members in workspace
// @access  Private
router.get('/online', auth, async (req, res) => {
  try {
    const { workspace } = req.query;

    if (!workspace) {
      return res.status(400).json({ message: 'Workspace ID required' });
    }

    const workspaceDoc = await Workspace.findById(workspace);

    if (!workspaceDoc) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const memberIds = workspaceDoc.members.map(m => m.user.toString());
    memberIds.push(workspaceDoc.owner.toString());

    const onlineUsers = await User.find({
      _id: { $in: memberIds },
      status: { $in: ['online', 'busy'] }
    }).select('name email avatar status lastActive');

    res.json(onlineUsers);
  } catch (error) {
    console.error('Get online members error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/teams/presence
// @desc    Update user presence status
// @access  Private
router.put('/presence', auth, async (req, res) => {
  try {
    const { status, workspace } = req.body;

    if (!['online', 'offline', 'busy', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.userId);
    user.status = status;
    user.lastActive = Date.now();
    await user.save();

    // Emit presence update to workspace
    const io = req.app.get('io');
    if (workspace) {
      io.to(`workspace-${workspace}`).emit('user-presence', {
        userId: req.userId,
        status,
        lastActive: user.lastActive
      });
    }

    res.json({ message: 'Presence updated', status });
  } catch (error) {
    console.error('Update presence error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
