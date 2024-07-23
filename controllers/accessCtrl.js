const { sendMail } = require("../sendMail");

const User = require("../models/userAuthModel");

const projectModel = require("../models/projectModel");

/////////////////////////////////////// Send Access invitation /////////////////////////////////////////////

exports.sendInvitationEmail = async (req, res) => {
  try {
    const data = req.body;

    const userId = req.user._id;

    console.log(userId);
    
    const projectId = req.params.projectId;

    const { userEmail, type } = data;
    if (!type) {
      return res
        .status(400)
        .json({ status: false, message: "Type is required" });
    }
    //// projectId subProjectId TaskId and SubTaskId Access need to think over it grant accesss and accept access how to determin which id is this
    let project;
    if (type === "project") {
      project = await projectModel.findById(projectId);
    }
    if (!project) {
      return res
        .status(404)
        .json({ status: false, message: "FolderFile not found" });
    }

    if (userId.toString() !== project.owner.toString()) {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized to grant access" });
    }

    const userToGrantAccess = await User.findOne({ email: userEmail });
    if (!userToGrantAccess) {
      return res
        .status(404)
        .json({ status: false, message: "User to grant access not found" });
    }

    // const invitationLink = `https://easyoctadoaccess.onrender.com/user/verification/accept-invitation?projectId=${FolderFileId}&userEmail=${userEmail}`;
    const invitationLink = `http://localhost:3001/user/project/acceptInvitation?projectId=${projectId}&userEmail=${userEmail}&type=${type}`;

    //  const invitationLink = `https://octado.vercel.app/AcceptInvitation/user/verification/accept-invitation?FolderFileId=${FolderFileId}&userEmail=${userEmail}`;

    const mailOptions = {
      from: process.env.email,
      to: userEmail,
      subject: "Invitation to Access EasyTaskSheduler",
      html: `<p>You have been invited to access a Project. Click <a href="${invitationLink}">here</a> to accept the invitation.</p>`,
    };

    await sendMail(mailOptions);

    res.status(200).json({ status: true, message: "Invitation sent" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

//////////////////////// Accept Invitation /////////////////////////////////////////////////////////////

exports.acceptInvitation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userEmail, projectId, type } = req.query;
    if (!type) {
      return res
        .status(400)
        .json({ status: false, message: "Type is required" });
    }

    let project;
    if (type === "project") {
      project = await projectModel.findById(projectId);
    }

    if (!project) {
      return res
        .status(404)
        .json({ status: false, message: "project not found" });
    }

    if (req.user.email !== userEmail) {
      return res
        .status(403)
        .json({
          status: false,
          message: "Unauthorized to accept this invitation",
        });
    }

    const hasAccess = await projectModel.findOne({
      _id: projectId,
      $or: [
        { users: userId },
        { owner: userId }
      ]
    });
    if (hasAccess) {
      return res
        .status(400)
        .json({
          status: false,
          message: "You already have access to this project",
        });
    }

    // folderFile.accessId.push({ user: userId, email: userEmail });

    // await grantAccessToChildFoldersAndFiles(folderFile._id, userId, userEmail);

    // await folderFile.save();

    const provideAccess = await projectModel.findByIdAndUpdate(
      projectId,
      { $push: { users: userId } },
      { new: true }
    );

    if(!provideAccess){
      return res
       .status(400)
       .json({ status: false, message: "Failed to provide access" });
    }

    res
      .status(200)
      .json({ status: true, message: "Invitation accepted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// Recursive Function to Grant Access to Child Folders and Files
const grantAccessToChildFoldersAndFiles = async (
  folderId,
  userId,
  userEmail
) => {
  try {
    const folder = await FolderFile.findById(folderId);

    // Grant access to the current folder if the user doesn't have it already
    const hasAccess = folder.accessId.some(
      (access) => String(access.user) === String(userId)
    );
    if (!hasAccess) {
      folder.accessId.push({ user: userId, email: userEmail });
      await folder.save();
    }

    // Traverse through children and grant access recursively
    for (const child of folder.children) {
      await grantAccessToChildFoldersAndFiles(child._id, userId, userEmail);
    }
  } catch (err) {
    console.error("Error granting access:", err);
    throw new Error(err.message);
  }
};

///////////////////////// Remove Access ///////////////////////////////

exports.removeAccess = async (req, res) => {
  try {
    const userId = req.user._id;

    const folderFileId = req.params.folderFileId;

    const folderFile = await FolderFile.findById(folderFileId);

    if (!folderFile) {
      return res
        .status(404)
        .json({ status: false, message: "FolderFile not found" });
    }

    if (String(folderFile.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized to remove access" });
    }

    await removeAccessFromChildFoldersAndFiles(folderFile);

    folderFile.accessId = [];

    await folderFile.save();

    res
      .status(200)
      .json({ status: true, message: "Access removed successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Function to remove access from child folders and files recursively

const removeAccessFromChildFoldersAndFiles = async (folderFile) => {
  if (folderFile.type === "folder") {
    folderFile.accessId = [];

    const childFoldersAndFiles = await FolderFile.find({
      parent: folderFile._id,
    });

    for (const child of childFoldersAndFiles) {
      await removeAccessFromChildFoldersAndFiles(child);
    }
  }
};

//// project subProject Task and SubTask Access need to think over it grant accesss and accept access
/* 
let model;
if(type === 'project') {
model = projectModel
}else if(type === 'subProject'){
  model = subProjectModel
  }else if(type === 'task'){
    model = taskModel
  }else if(type ==='subTask'){
    model = subTaskModel
  }else{
    return res
     .status(400)
     .json({ status: false, message: "Invalid type" });
  }
const checkAccess = await ${model}.findOne({
  _id: projectId,
  $or: [
    { users: userId },
    { owner: userId }
  ]
});  */