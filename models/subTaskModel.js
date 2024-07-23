const mongoose = require('mongoose');

const SubTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add sub-task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add sub-task description'],
    trim: true
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed','unable to complete'],
    default: 'not-started'
  },
  type:{
    type: String,
    default: 'subTask'  
  },
  date:{
    type:String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubTask', SubTaskSchema);
