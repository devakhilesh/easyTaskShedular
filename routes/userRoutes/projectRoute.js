const express = require('express')
const { authentication } = require('../../middi/auth')
const { projectCreation, projectUpdatation, projectDeletion, getAllProjects, getSingleProject, projectOrTaskAccess } = require('../../controllers/projectCtrl')
const { sendInvitationEmail, acceptInvitation } = require('../../controllers/accessCtrl')
const { subProjectOrTaskCreation } = require('../../controllers/subProjectOrTaskCtrl')
const router = express.Router()

router.route("/create").post(authentication, projectCreation)
router.route("/update/:projectId").put(authentication, projectUpdatation)
router.route("/delete/:projectId").delete(authentication, projectDeletion)
router.route("/allProjects").get(authentication, getAllProjects)
router.route("/getSingle/:projectId").get(authentication, getSingleProject)

// subProject 
router.route("/subProjects/create/:projectId").post(authentication, subProjectOrTaskCreation)
// Access 
router.route("/access/:projectId/:accessUserId").post(authentication,projectOrTaskAccess)


router.route("/acceptInvitation").get(authentication,acceptInvitation)


module.exports = router 