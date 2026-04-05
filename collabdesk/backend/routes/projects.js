const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');
const { projectValidation } = require('../middleware/validation');

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { workspace, status } = req.query;
    
    let query = {};
    
    if (workspace) {
      query.workspace = workspace;
    }
    
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('workspace', 'name slug')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID with tasks
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar status')
      .populate('workspace', 'name slug');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      ...project.toObject(),
      tasks
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', auth, projectValidation, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      workspace, 
      status, 
      priority, 
      startDate, 
      dueDate,
      tags,
      color,
      icon
    } = req.body;

    // Check if workspace exists and user is member
    const workspaceDoc = await Workspace.findById(workspace);
    if (!workspaceDoc) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspaceDoc.members.some(m => m.user.toString() === req.userId.toString()) ||
                     workspaceDoc.owner.toString() === req.userId.toString();
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const project = new Project({
      name,
      description,
      workspace,
      owner: req.userId,
      members: [{ user: req.userId, role: 'lead' }],
      status,
      priority,
      startDate,
      dueDate,
      tags,
      color,
      icon
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    await project.populate('workspace', 'name slug');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`workspace-${workspace}`).emit('project-created', project);

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or lead
    const member = project.members.find(m => m.user.toString() === req.userId.toString());
    const isOwner = project.owner.toString() === req.userId.toString();
    
    if (!isOwner && (!member || member.role !== 'lead')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatableFields = [
      'name', 'description', 'status', 'priority', 
      'startDate', 'dueDate', 'tags', 'color', 'icon'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    if (req.body.status === 'completed' && !project.completedAt) {
      project.completedAt = new Date();
    }

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${req.params.id}`).emit('project-updated', project);

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });

    const workspaceId = project.workspace;
    await project.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`workspace-${workspaceId}`).emit('project-deleted', { projectId: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or lead
    const member = project.members.find(m => m.user.toString() === req.userId.toString());
    const isOwner = project.owner.toString() === req.userId.toString();
    
    if (!isOwner && (!member || member.role !== 'lead')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(m => m.user.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userId, role });
    await project.save();

    await project.populate('members.user', 'name email avatar');

    res.json({
      message: 'Member added successfully',
      project
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/projects/:id/tasks
// @desc    Get all tasks for a project (Kanban board data)
// @access  Private
router.get('/:id/tasks', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { project: req.params.id };
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    // Group by status for Kanban
    const groupedTasks = {
      backlog: tasks.filter(t => t.status === 'backlog'),
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      in_review: tasks.filter(t => t.status === 'in_review'),
      completed: tasks.filter(t => t.status === 'completed')
    };

    res.json({ tasks, groupedTasks });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
