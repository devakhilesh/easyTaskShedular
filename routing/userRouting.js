const express = require('express');
const userRoute = express()

// Auth 
const userAuth = require("../routes/userRoutes/userAuthRoutes")
//Project
const project = require("../routes/userRoutes/projectRoute")
const teamCreation = require("../routes/userRoutes/teamRoute")

/// Auth
userRoute.use('/user/auth', userAuth)
// Project
userRoute.use('/user/project', project)
//
userRoute.use('/company/team', teamCreation)

module.exports = userRoute;