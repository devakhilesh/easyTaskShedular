
const { isValidObjectId } = require("mongoose");
const projectModel = require("../models/projectModel");
const userModel = require('../models/userAuthModel.js');

// ====================================== Get particular project Which has Access or Owner =================================
exports.getSingleProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const projectId = req.params.projectId

if(!projectId){
  return res.status(400).json({status: false, message: "projectId is required"})
}
const checkAccess = await projectModel.findOne({
  _id: projectId,
  $or: [
    { users: userId },
    { owner: userId }
  ]
});

if(!checkAccess){
  return res.status(404).json({ status: false, message: "project not found" });
}

    res
      .status(200)
      .json({
        status: true,
        message: "Project fetched Successfully",
        data: checkAccess,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                      new
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ====================================== Project Creation =================================

exports.projectCreation = async (req, res) => {
  try {
    const companyId = req.user._id;

    if (!companyId) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user" });
    }
    if (req.role !== "company") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });
    }

    const data = req.body;
    const { name, description } = data;
    data.companyId = companyId;

    if (!name || !description) {
      return res
        .status(400)
        .json({ status: false, message: "name and description is required" });
    }

    const saveProject = await projectModel.create(data);

    if (!saveProject) {
      return res
        .status(400)
        .json({
          status: false,
          message: "something wents wrong in Project creation",
        });
    }


    const updateNewFields = await projectModel.findByIdAndUpdate(
      saveProject._id,
      { $set: data },
      { new: true, upsert: true }
    );

    res
      .status(201)
      .json({
        status: true,
        message: "Project created Successfully",
        data: updateNewFields,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};

//////////////////////////////////////////////////////////// here can pass access any child then access will pass to next child evenafter that project is also a child =========================//


exports.projectOrTaskAccess = async (req, res) => {
  try {
    const companyId = req.user._id;
    const projectId = req.params.projectId;
    const accessUserId = req.params.accessUserId;
    const { accessType, cascade } = req.body;

    // Validate accessType
    if (!['owner', 'viewOnlyAccess'].includes(accessType)) {
      return res.status(400).json({ status: false, message: "Invalid access type" });
    }

    // Validate cascade
    if (!['allChild', 'Only For This'].includes(cascade)) {
      return res.status(400).json({ status: false, message: "Invalid cascade type" });
    }

    // Check if companyId exists
    if (!companyId) {
      return res.status(401).json({ status: false, message: "Unauthorized user" });
    }

    // Find the project
    const project = await projectModel.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ status: false, message: "Project not found" });
    }

    // Check if the user is authorized to change access
    const isOwner = project.owners.includes(companyId);
    if (!isOwner && project.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ status: false, message: "Unauthorized user" });
    }

    // Helper function to handle access changes
    const handleAccessChange = async (proj, accessType, accessUserId) => {
      const hasOwnerAccess = proj.owners.includes(accessUserId);
      const hasViewOnlyAccess = proj.viewOnlyAccess.includes(accessUserId);

      if (accessType === 'owner') {
        if (!hasOwnerAccess) {
          if (hasViewOnlyAccess) {
            proj.viewOnlyAccess.pull(accessUserId); // Remove from viewOnlyAccess
          }
          proj.owners.push(accessUserId); //Add to owners
        }
      } else if (accessType === 'viewOnlyAccess') {
        if (!hasViewOnlyAccess) {
          if (hasOwnerAccess) {
            proj.owners.pull(accessUserId); // Remove from owners
          }
          proj.viewOnlyAccess.push(accessUserId); // Add to viewOnlyAccess
        }
      }

      await proj.save();
    };

    // Recursive function to update child projects
    const updateChildProjects = async (parentProjectId, accessType, accessUserId) => {
      const parentProject = await projectModel.findById(parentProjectId).populate('childProjects');
      for (let child of parentProject.childProjects) {
        await handleAccessChange(child, accessType, accessUserId);
        await updateChildProjects(child._id, accessType, accessUserId);
      }
    };

    // Handle the access change for the current project
    await handleAccessChange(project, accessType, accessUserId);

    // Handle cascading if required
    if (cascade === 'allChild') {
      await updateChildProjects(project._id, accessType, accessUserId);
    }

    res.status(200).json({ status: true, message: "Access granted successfully", data: project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};

// ====================================== Project Updation Access User + Owner of the Project And project creator =================================

exports.projectUpdatation = async (req, res) => {
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
    // Find the project
    const project = await projectModel.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ status: false, message: "Project not found" });
    }

    // Check if the user is authorized to change access
    const isOwner = project.owners.includes(companyId);

    if (!isOwner && project.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ status: false, message: "Unauthorized user" });
    }

    const data = req.body;

    const updateNewFields = await projectModel.findByIdAndUpdate(
      projectId,
      { $set: data },
      { new: true, upsert: true }
    );

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


//========================= get All Projects ====================================

// Need to Modify 
//

const findTopAccessibleProject = async (projectId, userId, accessType) => {
  const project = await projectModel.findById(projectId).exec();
  
  if (!project) {
    return null;
  }

  const hasAccess = (
    (accessType === 'company' && project.companyId.toString() === userId.toString()) ||
    (accessType === 'owner' && project.owners.includes(userId)) ||
    (accessType === 'viewOnly' && project.viewOnlyAccess.includes(userId))
  );

  // If user has access and this project has no parent, it is the topmost accessible project
  if (hasAccess && !project.parentProject) {
    return project;
  } else if (hasAccess && project.parentProject) {
    // If the user has access but there's a parent project, recursively check the parent
    return await findTopAccessibleProject(project.parentProject, userId, accessType);
  }

  // If user does not have access, return null
  return null;
};


exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const accessType = req.query.accessType; // Assuming accessType is passed as a query parameter

    if (!['company', 'owner', 'viewOnly'].includes(accessType)) {
      return res.status(400).json({ status: false, message: "Invalid access type" });
    }

    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized user" });
    }

    // Find top-level projects where the user has access
    const accessibleProjects = await projectModel.find({
      $or: [
        { companyId: userId }, // Creator
        { owners: userId }, // Owner Access
        { viewOnlyAccess: userId } // View Only Access
      ],
      parentProject: { $exists: false } // Ensure it's a top-level project
    });

    // Recursively check each top-level project to find the most accessible one
    const topAccessibleProjects = [];
    for (const project of accessibleProjects) {
      const topAccessibleProject = await findTopAccessibleProject(project._id, userId, accessType);
      if (topAccessibleProject && !topAccessibleProjects.some(p => p._id.equals(topAccessibleProject._id))) {
        topAccessibleProjects.push(topAccessibleProject);
      }
    }

    res.status(200).json({ status: true, message: "Projects retrieved successfully", data: topAccessibleProjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
};
}

// here want to write logic whom who created project can see root project and who has owner Access can see all those project root  which he has access and veiw only can see all  those which projects root which has access 
/* 

const findTopAccessibleProject = async (projectId, userId, accessType) => {
  const project = await projectModel.findById(projectId).exec();
  
  if (!project) {
    return null;
  }

  const hasAccess = (
    (accessType === 'company' && project.companyId.toString() === userId.toString()) ||
    (accessType === 'owner' && project.owners.map(owner => owner.toString()).includes(userId.toString())) ||
    (accessType === 'viewOnly' && project.viewOnlyAccess.map(viewer => viewer.toString()).includes(userId.toString()))
  );

  if (hasAccess) {
    if (!project.parent) {
      return project;
    }

    return await findTopAccessibleProject(project.parent, userId, accessType);
  }

  return null;
};

exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const accessType = req.query.accessType;

    if (!['company', 'owner', 'viewOnly'].includes(accessType)) {
      return res.status(400).json({ status: false, message: "Invalid access type" });
    }

    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized user" });
    }

    const accessibleProjects = await projectModel.find({
      $or: [
        { companyId: userId },
        { owners: userId },
        { viewOnlyAccess: userId }
      ]
    });

    const topAccessibleProjects = [];
    for (const project of accessibleProjects) {
      const topAccessibleProject = await findTopAccessibleProject(project._id, userId, accessType);
      if (topAccessibleProject && !topAccessibleProjects.some(p => p._id.equals(topAccessibleProject._id))) {
        topAccessibleProjects.push(topAccessibleProject.toObject({ transform: (doc, ret) => { delete ret.childProjects; return ret; }}));
      }
    }

    res.status(200).json({ status: true, message: "Projects retrieved successfully", data: topAccessibleProjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};



 */


//=================================== Delete Project =================================

exports.projectDeletion = async (req, res) => {
  try {
    const companyId = req.user._id;
    const projectId = req.params.projectId;

    if (!companyId) {
      return res.status(401).json({ status: false, message: "Unauthorized user" });
    }

    if (!projectId) {
      return res.status(400).json({ status: false, message: "projectId is required" });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ status: false, message: "Invalid project ID" });
    }

    // Find the project
    const project = await projectModel.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ status: false, message: "Project not found" });
    }

    // Check if the user is authorized to delete the project
    const isOwner = project.owners.includes(companyId);
    if (!isOwner && project.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ status: false, message: "Unauthorized user" });
    }

    // Start deletion process
    await this.deleteChildProjects(projectId); // Delete all child projects
    await projectModel.findByIdAndDelete(projectId); // Delete the main project

    res.status(200).json({ status: true, message: "Project and all associated child projects deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};


//================ Function to recursively delete child projects=======================
exports.deleteChildProjects = async (parentProjectId) => {
  // Find the parent project and populate child projects
  const parentProject = await projectModel.findById(parentProjectId).populate('childProjects');

  // Base case: If the parent project has no child projects, stop recursion
  if (!parentProject || parentProject.childProjects.length === 0) {
    return; // No further recursion needed
  }

  // Recursive case: Process each child project
  for (let child of parentProject.childProjects) {
    await deleteChildProjects(child._id); // Recursively delete child projects
    await projectModel.findByIdAndDelete(child._id); // Delete the child project
  }
};


// owner or veiw only => projectId pass in the params 
exports.getParticularProject = async (req, res)=>{
  try{

  }catch(err){
    res.status(500).json({status:false , message:err.message});
  }
}

// company can check any team members all task data 


// remains mn nhi kr rha ye project krne ka 


