

const { isValidObjectId } = require("mongoose");
const projectModel = require("../models/projectModel");
const userModel = require('../models/userAuthModel.js');


exports.subProjectOrTaskCreation  = async (req, res) => {
    try {

     const companyId = req.user._id;
  
      const projectId = req.params.projectId;
  
      if (!companyId) {
        return res.status(401).json({ status: false, message: "Unauthorized user" });
      }
  if(!projectId) {
    return res.status(400).json({status: false, message: "projectId is required"})
  }
  
  if(!isValidObjectId(projectId)){
    return res.status(400).json({status: false, message: "Invalid project ID"})
  }
      const project = await projectModel.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ status: false, message: "Project not found" });
      }
  
      // Check if the user is authorized to change access
      const isOwner = project.owners.includes(companyId);
      if (!isOwner && project.companyId.toString() !== companyId.toString()) {
        return res.status(403).json({ status: false, message: "Unauthorized user" });
      }
  
      const data = req.body;

 const { name, description } = data;

    data.companyId = companyId;

    if (!name || !description) {
      return res
        .status(400)
        .json({ status: false, message: "name and description is required" });
    }

data.owners = project.owners
data.viewOnlyAccess = project.viewOnlyAccess 
data.parent = projectId
const subProjectOrTaskSave = await projectModel.create(data)

      const updateNewFields = await projectModel.findByIdAndUpdate(
        subProjectOrTaskSave._id,
        { $set: data },
        { new: true, upsert: true }
      );
  
      await projectModel.findByIdAndUpdate(projectId,{$push: {childProjects:subProjectOrTaskSave._id}})

      res
        .status(201)
        .json({
          status: true,
          message: "Project updated Successfully",
          data: updateNewFields,
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message });
    }
  };
  

