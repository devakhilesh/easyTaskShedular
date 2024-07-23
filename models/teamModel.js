const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    teamInvitation:{
        type: Boolean,
        default: false,
    }

  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Team", teamSchema);
