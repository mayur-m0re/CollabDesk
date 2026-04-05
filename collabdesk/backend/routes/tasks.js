const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { taskValidation } = require('../middleware/validation');

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      project, 
      workspace, 
      status, 
      assignee, 
      priority,
      search,
      dueBefore,
      dueAfter
    } = req.query;
    
    let query = {};
    
    if (project) query.project = project;
    if (workspace) query.workspace = workspace;
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (priority) query.priority = priority;
    if (dueBefore) query.dueDate = { ...query.dueDate, $lte: new Date(dueBefore) };
    if (dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(dueAfter) };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color')
      .populate('watchers', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(100);

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color workspace')
      .populate('watchers', 'name email avatar')
      .populate('comments.author', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', auth, taskValidation, async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      status,
      priority,
      type,
      dueDate,
      estimatedHours,
      labels,
      subtasks,
      dependencies
    } = req.body;

    // Get project to find workspace
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      title,
      description,
      project,
      workspace: projectDoc.workspace,
      assignee,
      reporter: req.userId,
      status: status || 'backlog',
      priority: priority || 'medium',
      type: type || 'task',
      dueDate,
      estimatedHours,
      labels,
      subtasks,
      dependencies,
      watchers: [req.userId]
    });

    await task.save();

    // Populate for response
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    // Create notification for assignee
    if (assignee && assignee !== req.userId.toString()) {
      const notification = new Notification({
        recipient: assignee,
        sender: req.userId,
        type: 'task_assigned',
        title: 'New task assigned',
        message: `You have been assigned to "${title}"`,
        data: {
          task: task._id,
          project: project
        }
      });
      await notification.save();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${project}`).emit('task-created', task);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const previousAssignee = task.assignee?.toString();
    const previousStatus = task.status;

    const updatableFields = [
      'title', 'description', 'assignee', 'status', 'priority',
      'type', 'dueDate', 'estimatedHours', 'actualHours',
      'labels', 'subtasks', 'dependencies', 'order'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Set completedAt if status changed to completed
    if (req.body.status === 'completed' && previousStatus !== 'completed') {
      task.completedAt = new Date();
    }

    await task.save();

    // Populate for response
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    // Notify new assignee
    if (req.body.assignee && 
        req.body.assignee !== req.userId.toString() && 
        req.body.assignee !== previousAssignee) {
      const notification = new Notification({
        recipient: req.body.assignee,
        sender: req.userId,
        type: 'task_assigned',
        title: 'Task assigned to you',
        message: `You have been assigned to "${task.title}"`,
        data: {
          task: task._id,
          project: task.project
        }
      });
      await notification.save();
    }

    // Notify watchers of status change
    if (req.body.status && req.body.status !== previousStatus) {
      for (const watcherId of task.watchers) {
        if (watcherId.toString() !== req.userId.toString()) {
          const notification = new Notification({
            recipient: watcherId,
            sender: req.userId,
            type: 'task_updated',
            title: 'Task updated',
            message: `"${task.title}" status changed to ${req.body.status}`,
            data: {
              task: task._id,
              project: task.project
            }
          });
          await notification.save();
        }
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${task.project}`).emit('task-updated', task);

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only reporter or project owner can delete
    const project = await Project.findById(task.project);
    const canDelete = task.reporter.toString() === req.userId.toString() ||
                      project.owner.toString() === req.userId.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projectId = task.project;
    await task.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${projectId}`).emit('task-deleted', { taskId: req.params.id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      author: req.userId,
      content
    });

    await task.save();
    await task.populate('comments.author', 'name email avatar');

    // Notify watchers
    for (const watcherId of task.watchers) {
      if (watcherId.toString() !== req.userId.toString()) {
        const notification = new Notification({
          recipient: watcherId,
          sender: req.userId,
          type: 'comment_added',
          title: 'New comment',
          message: `New comment on "${task.title}"`,
          data: {
            task: task._id,
            project: task.project
          }
        });
        await notification.save();
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`project-${task.project}`).emit('new-comment', {
      taskId: req.params.id,
      comment: task.comments[task.comments.length - 1]
    });

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks/:id/watch
// @desc    Toggle watch status for task
// @access  Private
router.post('/:id/watch', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isWatching = task.watchers.includes(req.userId);

    if (isWatching) {
      task.watchers = task.watchers.filter(w => w.toString() !== req.userId.toString());
    } else {
      task.watchers.push(req.userId);
    }

    await task.save();

    res.json({
      message: isWatching ? 'Unwatched task' : 'Watching task',
      watching: !isWatching
    });
  } catch (error) {
    console.error('Toggle watch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/tasks/bulk-update
// @desc    Bulk update tasks (for drag and drop)
// @access  Private
router.post('/bulk-update', auth, async (req, res) => {
  try {
    const { updates } = req.body;
    // updates: [{ taskId, status, order }]

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.taskId },
        update: { 
          $set: { 
            status: update.status, 
            order: update.order 
          } 
        }
      }
    }));

    await Task.bulkWrite(bulkOps);

    // Emit updates
    const io = req.app.get('io');
    for (const update of updates) {
      const task = await Task.findById(update.taskId);
      if (task) {
        io.to(`project-${task.project}`).emit('task-updated', task);
      }
    }

    res.json({ message: 'Tasks updated successfully' });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
