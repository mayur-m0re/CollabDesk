const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: false },
    allowGuests: { type: Boolean, default: false },
    defaultProjectVisibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'team'
    }
  },
  logo: {
    type: String,
    default: null
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  }
}, {
  timestamps: true
});

// Generate slug from name
workspaceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema);
