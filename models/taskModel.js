const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add task description'],
    trim: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  subProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  type:{
    type: String,
    default: 'task'  
  },
  date:{
    type:String,
    required: true,
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
