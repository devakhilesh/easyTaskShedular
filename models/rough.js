const mongoose = require('mongoose');

const rough = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
},{ strict: false });

module.exports = mongoose.model("rough", rough)



