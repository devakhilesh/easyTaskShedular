const express = require('express');
const { addTeam, teamAcceptInvitation, getAllTeamMemberList, getPrticularMember, updatePrticularMember, removePrticularMember } = require('../../controllers/teamCtrl');
const { authentication } = require('../../middi/auth');
const router = express.Router();

router.route("/sendTeamRequest").post(authentication,addTeam)

router.route("/acceptTeamRequest").put(authentication,teamAcceptInvitation)

router.route("/getAllTeamList").get(authentication, getAllTeamMemberList)

router.route("/particularMember/:teamMemberId").get(authentication, getPrticularMember )

router.route("/updateMember/:teamMemberId").put(authentication, updatePrticularMember )

router.route("/removeMember/:teamMemberId").delete(authentication, removePrticularMember )



module.exports = router