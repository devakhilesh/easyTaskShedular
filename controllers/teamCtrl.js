const teamModel = require("../models/teamModel");

const userModel = require("../models/userAuthModel");
const { sendMail } = require("../sendMail");

//////////////////// add employees for team members //////////////////////////////////

exports.addTeam = async (req, res) => {
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

    const { name, email, about, role } = data;
    data.companyId = companyId;

    if (!name) {
      return res
        .status(400)
        .json({ status: false, message: "Name is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }
    if (!role) {
      return res
        .status(400)
        .json({ status: false, message: "Role is required" });
    }
    const checkAlreadyExist = await teamModel.findOne({ email: email });

    if (checkAlreadyExist) {
      let teamId = checkAlreadyExist._id;

      const invitationLink = `http://localhost:3001/company/team/acceptTeamRequest?teamId=${teamId}&email=${email}`;

      const mailOptions = {
        from: process.env.email,
        to: email,
        subject: "Invitation to add as a team member of the company",
        html: `<p>You have been invited to be a member of the company. Click <a href="${invitationLink}">here</a> to accept the invitation.</p>`,
      };
      await sendMail(mailOptions);

      return res.status(200).json({
        status: true,
        message: "Team member Added  and Invitation sent successfully",
        data: checkAlreadyExist,
      });
    }

    const team = await teamModel.create(data);

    if (!team) {
      return res
        .status(400)
        .json({ status: false, message: "Failed to create team" });
    }
    let teamId = team._id;
    const invitationLink = `http://localhost:3001/company/team/acceptTeamRequest?teamId=${teamId}&email=${email}`;

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: "Invitation to add as a team member of the company",
      html: `<p>You have been invited to be a member of the company. Click <a href="${invitationLink}">here</a> to accept the invitation.</p>`,
    };
    await sendMail(mailOptions);

    res.status(200).json({
      status: true,
      message: "Team member Added  and Invitation sent successfully",
      data: team,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
////////////////////  employees Accept Request for team members //////////////////////////////////

exports.teamAcceptInvitation = async (req, res) => {
  try {
    const userId = req.user._id;

    const { teamId, email } = req.query;
    

if(!teamId || !email){
    return res.status(400).json({status: false, message:"required data is missing ask to you company or owner to invite you"})
}
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    if (user._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized to verify this user" });
    }

    if (req.user.email !== email) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized to accept this invitation",
      });
    }

    const alreadyAdded = await teamModel.findOne({
      _id: teamId,
      userId: userId,
    });
    if (alreadyAdded) {
      return res.status(400).json({
        status: false,
        message: "You already added as a team of company members",
      });
    }

// main check company really ask him to add or not email check
const check = await teamModel.findById(teamId)

if (!check) {
    return res.status(404).json({
      status: false,
      message: "required data is missing ask to you company or owner to invite you"
    });
  }
if(check.email !== email){
return res.status(403).json({status: false, message:"unauthorized Access"});
}

    const team = await teamModel.findByIdAndUpdate(
      teamId,
      { userId: user._id, teamInvitation: true },
      { new: true }
    );

    if (!team) {
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


//////////////////// company can see All employees List //////////////////////////////////

exports.getAllTeamMemberList = async (req, res)=>{
    try{
const userId = req.user._id

if (req.role !== "company") {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized user" });
  }
const company = await userModel.findById(req.user._id)

const team = await teamModel.find({companyId: userId })

if(team.length == 0){
    return res
       .status(404)
       .json({ status: false, message: "No team found" });
}
res.status(200).json({ status: true, message:`${company.name} team members Lists`, team });

    }catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}

//////////////////// company can see Particular employee data //////////////////////////////////

exports.getPrticularMember = async (req, res)=>{
    try{

        const userId = req.user._id
const teamMemberId = req.params.teamMemberId

if (req.role !== "company") {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized user" });
  }
const company = await userModel.findById(req.user._id)

const team = await teamModel.findOne({companyId: userId, userId:teamMemberId})

if(!team){
    return res
       .status(404)
       .json({ status: false, message: "No team found" });
}
res.status(200).json({ status: true, message:`${company.name} here is the detail of one of your team member`, team });

    }catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}

//////////////////// company can update Particular employee data //////////////////////////////////

exports.updatePrticularMember = async (req, res)=>{
    try{

const userId = req.user._id

const teamMemberId = req.params.teamMemberId
const data = req.body

    const { name, about, role } = data;



if (req.role !== "company") {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized user" });
  }

if(name && name === ""){
    return res
       .status(400)
       .json({ status: false, message: "Name is required" });
}
if(role && role == ""){
    return res
       .status(400)
       .json({ status: false, message: "role is required" });
}
const company = await userModel.findById(req.user._id)

const team = await teamModel.findOneAndUpdate({companyId: userId, userId:teamMemberId},{$set:{name:data.name, about:data.about , role:data.role}}, {new:true})


if(!team){
    return res
       .status(404)
       .json({ status: false, message: "No team found" });
}

res.status(200).json({ status: true, message:`${company.name} here is the updated detail of one of your team member`, team });

    }catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}

//////////////////// company can remove  Particular employee data with Project access //////////////////////////////////

exports.removePrticularMember = async (req, res)=>{
    try{

const userId = req.user._id

const teamMemberId = req.params.teamMemberId

if (req.role !== "company") {
    return res
      .status(403)
      .json({ status: false, message: "Unauthorized user" });
  }


const company = await userModel.findById(req.user._id)

const team = await teamModel.findOneAndDelete({companyId: userId, userId:teamMemberId})

if(!team){
    return res
       .status(404)
       .json({ status: false, message: "No team found" });
}

///// need to write logic to remove access from all project as well 




res.status(200).json({ status: true, message:`${company.name} team member removed successfully`, team });

    }catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
}