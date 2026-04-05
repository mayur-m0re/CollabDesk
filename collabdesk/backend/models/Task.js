const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'in_review', 'completed', 'cancelled'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['task', 'bug', 'feature', 'improvement', 'epic'],
    default: 'task'
  },
  dueDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    default: null
  },
  actualHours: {
    type: Number,
    default: null
  },
  labels: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [commentSchema],
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false }
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedAt: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update project progress when task status changes
taskSchema.post('save', async function() {
  const Project = mongoose.model('Project');
  const project = await Project.findById(this.project);
  if (project) {
    await project.updateProgress();
  }
});

taskSchema.post('remove', async function() {
  const Project = mongoose.model('Project');
  const project = await Project.findById(this.project);
  if (project) {
    await project.updateProgress();
  }
});

module.exports = mongoose.model('Task', taskSchema);
