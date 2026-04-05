const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');
const { workspaceValidation } = require('../middleware/validation');

// @route   GET /api/workspaces
// @desc    Get all workspaces for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar status')
      .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar status lastActive');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    const isMember = workspace.members.some(m => m.user._id.toString() === req.userId.toString()) ||
      workspace.owner._id.toString() === req.userId.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workspace);
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/workspaces
// @desc    Create new workspace
// @access  Private
router.post('/', auth, workspaceValidation, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // ✅ Ensure unique slug
    let existing = await Workspace.findOne({ slug });
    let counter = 1;

    while (existing) {
      slug = `${slug}-${counter++}`;
      existing = await Workspace.findOne({ slug });
    }


    const workspace = new Workspace({
      name,
      description,
      slug,
      owner: req.userId,
      members: [{ user: req.userId, role: 'owner' }],
      settings
    });

    await workspace.save();

    // Add workspace to user's workspaces
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $push: { workspaces: workspace._id }
    });

    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar');

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, settings, logo } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const member = workspace.members.find(m => m.user.toString() === req.userId.toString());
    const isOwner = workspace.owner.toString() === req.userId.toString();

    if (!isOwner && (!member || member.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };
    if (logo) workspace.logo = logo;

    await workspace.save();
    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar status');

    res.json({
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only owner can delete workspace' });
    }

    // Delete all projects and tasks in workspace
    const projects = await Project.find({ workspace: req.params.id });
    for (const project of projects) {
      await Task.deleteMany({ project: project._id });
    }
    await Project.deleteMany({ workspace: req.params.id });

    // Remove workspace from users
    const User = require('../models/User');
    await User.updateMany(
      { workspaces: req.params.id },
      { $pull: { workspaces: req.params.id } }
    );

    await workspace.deleteOne();

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const member = workspace.members.find(m => m.user.toString() === req.userId.toString());
    const isOwner = workspace.owner.toString() === req.userId.toString();

    if (!isOwner && (!member || member.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(m => m.user.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();

    // Add workspace to user's workspaces
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id }
    });

    await workspace.populate('members.user', 'name email avatar status');

    res.json({
      message: 'Member added successfully',
      workspace
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove member from workspace
// @access  Private
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const member = workspace.members.find(m => m.user.toString() === req.userId.toString());
    const isOwner = workspace.owner.toString() === req.userId.toString();

    if (!isOwner && (!member || member.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Cannot remove owner
    if (req.params.userId === workspace.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== req.params.userId);
    await workspace.save();

    // Remove workspace from user's workspaces
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { workspaces: workspace._id }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workspaces/:id/stats
// @desc    Get workspace statistics
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    const isMember = workspace.members.some(m => m.user.toString() === req.userId.toString()) ||
      workspace.owner.toString() === req.userId.toString();

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projectCount = await Project.countDocuments({ workspace: req.params.id });
    const taskCount = await Task.countDocuments({ workspace: req.params.id });
    const completedTaskCount = await Task.countDocuments({
      workspace: req.params.id,
      status: 'completed'
    });

    res.json({
      projects: projectCount,
      tasks: taskCount,
      completedTasks: completedTaskCount,
      members: workspace.members.length
    });
  } catch (error) {
    console.error('Get workspace stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
