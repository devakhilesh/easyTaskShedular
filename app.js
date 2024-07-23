
// credentials = require('./middi/credentials.js');
// const corsOptions = require('./config/corsOptions.js');
const express =require("express")
const fileUpload = require('express-fileupload');
const cloudinary = require("cloudinary").v2;
const cors = require("cors")
const app = express()
const rough = require("./models/rough")
const path = require('path')
// app.use(fileUpload({
//     useTempFiles:true
// }))
// app.use(fileUpload());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

app.use(express.json())


//// need to ask to Sachin if he can manage then i will procceed
app.post("/roughCreate", async (req, res) => {
  try {
    const data = req.body;
    const { name, age, email } = data;

    if (!name || !age || !email) {
      return res.status(400).json({ status: false, message: "Name, age, and email are required" });
    }
const saveData  = await rough.create(data)
    // Upsert using findOneAndUpdate to create a new document if it does not exist
    const updateNewFields = await rough.findByIdAndUpdate(
      saveData._id,
      { $set: data },
      { new: true, upsert: true }
    );

    return res.status(200).json({ status: true, message: "Rough created or updated successfully", data: saveData });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});

app.put("/roughUpdate/:roughId", async (req, res) => {
  try {
    const data = req.body;
    const { roughId } = req.params;

    // Upsert using findByIdAndUpdate to update or create a document based on _id
    const updateNewFields = await rough.findByIdAndUpdate(
      roughId,
      { $set: data },
      { new: true, upsert: true }
    );

    return res.status(200).json({ status: true, message: "Rough updated successfully", data: updateNewFields });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
});









// app.use(cors({
//   origin: "http://localhost:3000",
//   // origin: "https://ssu-admin.netlify.app",
// }))

// app.use(cors(corsOptions));

app.use(cors())


cloudinary.config({
    cloud_name: "decjoyrmj",
    api_key: "627647724186355",
    api_secret: "mw_DjfFMzfZ2pKOWv1hNyuP8T0A"
  });
   

  // routes will be here 
  app.get("/", async (req, res) => {
    res.send("Hello World!")
  })


  const userRoute = require("./routing/userRouting")



  app.use("/", userRoute);
  
module.exports = app