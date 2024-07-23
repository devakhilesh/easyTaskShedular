/* const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add project description'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
type:{
  type: String,
  default: 'project'  
}
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
 */

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({

companyId:{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  owners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  viewOnlyAccess: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  parent:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  childProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
},{ strict: false });

module.exports = mongoose.model("Project", projectSchema);
