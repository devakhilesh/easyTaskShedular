const express = require("express")
const { register, verifyEmail, resendOTP, forgetpassword, resetPassword, changePassword, loginUser, getProfile } = require("../../controllers/userAuthCtrl")
const { authentication } = require("../../middi/auth")

let router = express.Router()



////////////////// User Route ////////////////

////////////////// user ////////////////////////

router.route("/register").post(register)

router.route("/verify").post(verifyEmail)

router.route("/resendOtp").post(resendOTP)

router.route("/forgetPass").post(forgetpassword)

router.route("/resetPassword").post(resetPassword)

// router.route("/changePass").post(authentication, changePassword)

router.route("/changePassword").post(authentication,changePassword)

router.route("/logIn").post(loginUser)

router.route('/profile').get(authentication, getProfile);



module.exports = router