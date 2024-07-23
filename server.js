require("dotenv/config")

const mongoose = require("mongoose")
const express = require("express")


const app = require("./app");


 
mongoose.connect(process.env.MONGODB_URL_LOCAL, {

  })

  .then(()=> console.log("MongoDB connected successfully"))
  .catch((err)=> console.log(err.message))
  


  const port = process.env.PORT 
  
  app.listen(port , ()=>{
      console.log(`App running on port ${port}` )
  })
 

