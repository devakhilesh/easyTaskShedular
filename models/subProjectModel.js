const mongoose = require('mongoose');

const SubProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add sub-project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add sub-project description'],
    trim: true
  },
  parentProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type:{
    type: String,
    default: 'subProject'  
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubProject', SubProjectSchema);
