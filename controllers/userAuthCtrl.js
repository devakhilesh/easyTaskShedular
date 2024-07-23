const userModel = require('../models/userAuthModel.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validation = require('../validations/validation');
const cloudinary = require('cloudinary').v2;
const jwt = require("jsonwebtoken")
const otpModel = require("../models/userOtpModel.js");
const otpGenerator = require("otp-generator")
const { sendMail } = require('../sendMail.js');



exports.register = async function (req, res) {
    try {
      const userData = req.body
  
      let { name, email, password, fcmToken } = userData;
  
      if (Object.keys(userData).length == 0) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide required fields" });
      }
  
      if (!name) {
        return res
          .status(400)
          .send({ status: false, message: "Name is mandatory" });
      }
  
      if (typeof name != "string") {
        return res
          .status(400)
          .send({ status: false, message: "Name should be a string" });
      }
  

      name = userData.name = name.trim();
  
      if (name == "") {
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid name" });
      }
  
      if (!validation.validateName(name)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide a valid name" });
      }
  
      if (!email) {
        return res
          .status(400)
          .send({ status: false, message: "Email is mandatory" });
      }
  
      if (typeof email != "string") {
        return res
          .status(400)
          .send({ status: false, message: "Email should be a string" });
      }
  
      email = userData.email = email.trim().toLowerCase();
  
      if (email == "") {
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid email" });
      }
  
      if (!validation.validateEmail(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Please provide a valid email" });
      }
  
      if (!password) {
        return res
          .status(400)
          .send({ status: false, message: "Password is mandatory" });
      }
  
      if (typeof password != "string") {
        return res
          .status(400)
          .send({ status: false, message: "Password should be a string" });
      }
  
      password = userData.password = password.trim();
  
      if (password == "") {
        return res
          .status(400)
          .send({ status: false, message: "Please provide a valid password" });
      }
  
      const userExist = await userModel.findOne({ email: email });
  
      if (userExist) {
          return res
            .status(400)
            .send({ status: false, message: "Email already exists" });
        
      }
      // Generate OTP and store in the database
      let otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
  
      
      
    await otpModel.deleteMany({ email:email});
  
    const createOtp =  await otpModel.create({ email, otp });
    console.log(createOtp)
  
      // Send verification email with OTP...
      const mailOptions = {
        from: process.env.email,
        to: email,
        subject: "EasyTaskSheduler Verification Code!",
        html: `
          <p>Hello ${name},</p>
          <p>Welcome to EasyTaskSheduler! Your OTP verification code is: <strong>${otp}</strong>.</p>
          <p>Thank you for registering.</p>
        `,
      };
  
      await sendMail(mailOptions);
  
      return res
        .status(200)
        .send({ status: true, message: "Verification code sent successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  /////////// verify otp ////////////
  
  exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
  
        const storedOTP = await otpModel.findOne({ email:email, otp:otp});
  
        if(!storedOTP){
          return res.status(400).json({ status: false, message: "Invalid OTP" });
        }
  
        const userData = req.body;
  
        const { name, password, fcmToken, role } = userData;
  

  
        if (typeof password !== 'string' || !password.trim()) {
            return res.status(400).json({ status: false, message: "Invalid password" });
        }
  
        const hashing = bcrypt.hashSync(password, 10);
  
        userData.password = hashing;
  
        const userCreated = await userModel.create(userData);
  
        userCreated.isVerified = true;
  
        await userCreated.save();
  
        await otpModel.deleteMany({ email });
  
    
     let token = jwt.sign(
            { email: userCreated.email, _id: userCreated._id, role:userCreated.role, },
            process.env.JWT_SECRET_KEY
        );
    
        return res.status(200).json({
            status: true,
            message: "Email verified successfully",
            data: userCreated,
            token: token,
        });
    } catch (err) {
        console.error("Error in verifyEmail:", err);
        return res.status(500).json({ status: false, message: err.message });
    }
  };
  
  //////////// resend otp ///////////
  
  exports.resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false, 
      });
  
      const updatedOTP = await otpModel.findOneAndUpdate(
        { email: email },
        { otp: otp },
        { new: true }
      );
  
      if (!updatedOTP) {
        await otpModel.create({ email: email, otp: otp });
      }
      /////////////////// sending verification email /////////
  
      const mailOptions = {
        from: process.env.email,
        to: email,
        subject: "New OTP Verification Code From EasyTaskSheduler",
        text: `Your new OTP verification code is: ${otp}`,
      };
  
      await sendMail(mailOptions);
  
  res.status(200).json({status:true , message :"Otp sent successfully"})
  
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  };
  
  exports.loginUser = async function (req, res) {
    try {
      let data = req.body;
      let { email, password} = data;
  
      if (Object.keys(data).length == 0)
        return res
          .status(400)
          .send({ status: false, message: "Please send data" });
  
      if (!email)
        return res
          .status(400)
          .send({ status: false, message: "Please enter Emaill" });
  
      if (email != undefined && typeof email != "string")
        return res
          .status(400)
          .send({
            status: false,
            message: "Please enter Emaill in string format",
          });
  
      email = data.email = email.trim();
  
      if (email == "")
        return res
          .status(400)
          .send({ status: false, message: "Please enter Email value" });
  
      if (!validation.validateEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid Email" });
  
      if (!password)
        return res
          .status(400)
          .send({ status: false, message: "Please enter password" });
  
      if (password != undefined && typeof password != "string")
        return res
          .status(400)
          .send({
            status: false,
            message: "Please enter password in string format",
          });
  
      password = data.password = password.trim();
  
      if (password == "")
        return res
          .status(400)
          .send({ status: false, message: "Please enter password" });

  
      let isUserExist = await userModel.findOne({ email: email });

      if (!isUserExist)
        return res
          .status(404)
          .send({ status: false, message: "No user found with given Email" });
  
      if (!isUserExist.isVerified) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Email is not verified. Please verify your email",
          });
      }
  
      //Decrypt
      let passwordCompare = await bcrypt.compare(password, isUserExist.password);
      if (!passwordCompare)
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid password" });
  
      // console.log(isUserExist.role);
      let token = jwt.sign(
        { _id: isUserExist._id, role: isUserExist.role , email:isUserExist.email},
        process.env.JWT_SECRET_KEY
      );
  ///////////////////// storing notes Data ////////////////////////
  
  
  // let updatefcm;
  if(isUserExist.fcmToken){
  if(data.fcmToken) {
   await userModel.findByIdAndUpdate(isUserExist._id, {fcmToken: data.fcmToken}, {new:true});
  }
  }
  // console.log(updatefcm,"fcmToken Updated Successfully")
  
      return res
        .status(200)
        .send({ status: true, message: "User login successfull", data: token });
    } catch (err) {
      return res.status(500).send({ status: false, error: err.message });
    }
  };




  
  exports.forgetpassword = async function (req, res) {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res
          .status(400)
          .send({ status: false, message: "Email is mandatory" });
      }
  
      const user = await userModel.findOne({email:email });
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found ..." });
      }
  
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
  
      await otpModel.findOneAndDelete({ email });
  
      await otpModel.create({ email, otp });
  
      const mailOptions = {
        from: process.env.email,
        to: email,
        subject: "Password Reset OTP For EasyTaskSheduler",
        text: `Your OTP for password reset is: ${otp}`,
      };
  
      await sendMail(mailOptions);
  
  res.status(200).json({status:false, message:"Please check your mail and enter your OTP for password reset"})
  
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  };
  
  exports.resetPassword = async function (req, res) {
    try {
      const { email, otp, newPassword } = req.body;
  
      if (!email || !otp || !newPassword) {
        return res
          .status(400)
          .send({
            status: false,
            message: "Please provide email, OTP, and new password",
          });
      }
  
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
  
      const storedOTP = await otpModel.findOne({ email: user.email, otp: otp });

      if (!storedOTP) {
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }
      // Reset password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      // Remove OTP after successful password reset
  
      await otpModel.findOneAndDelete({ email });
  
      return res
        .status(200)
        .json({ status: true, message: "Password reset successfully" });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  // user should be authenticated
  
  exports.changePassword = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Please provide email, old password, and new password",
          });
      }
  
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
  
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  
      if (!isOldPasswordValid) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid old password" });
      }
  
      // Update password
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();
  
      return res
        .status(200)
        .json({ status: true, message: "Password changed successfully" });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: false, message: error.message });
    }
  };
  
  
  //// logIn with google ///////////
  
  exports.signInWithGoogle = async (req, res) => {
    try {
      const data = req.body
      const { email, fcmToken, name } = data;
  
      if (!email || !fcmToken || !name) {
        return res.status(400).json({ status: false, message: "Unable to log in with Google" });
      }
  
      data.isVerified = true;
  
      let user = await userModel.findOne({ email: email });
  

  
      if (!user) {
  

  
        user = await userModel.create(data);
  
        const token = jwt.sign({ _id: user._id, email:user.email}, process.env.JWT_SECRET_KEY);
  
        return res.status(200).json({ status: true, message: "User created successfully", data: user, token:token });
  
      }

  
  
      const token = jwt.sign({ _id: user._id, email:user.email}, process.env.JWT_SECRET_KEY);
  

  
      if(user.fcmToken){
      if(fcmToken) {
        await userModel.findByIdAndUpdate(user._id, {fcmToken: fcmToken}, {new:true});
      }
      }
      // console.log(updatefcm,"fcmToken Updated Successfully")
  
  
      return res.status(200).json({ status: true, message: "User updated successfully", data: user, token: token });
  
    } catch (error) {
  
      return res.status(500).json({ status: false, message:error.message});
    }
  }
  
  
  exports.getProfile = async (req ,res)=>{
    try{

const profile = await userModel.findById(req.user._id)
if(!profile){
    return res.status(404).json({ status: false, message: "User not found" })
}
return res.json({ status: true, message:"profile", data: profile})
    }catch(err){
        res.status(500).json({ status: false, message:err.message
    })
}
  }