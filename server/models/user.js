const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["CUSTOMER", "DELIVERY_AGENT", "ADMIN"], // Allowed roles
      default: "CUSTOMER",
    },
    latitude: {
      type: Number,
      required: true,
      default:0
    },
    longitude: {
      type: Number,   
      required: true,
      default:0
    },
    isConfirmed: {
      type: Boolean,
      default: false, // Default value set to false
    },
    isDeleted: {
      type: Boolean,
      default: false, // Default value set to false
    },
    delivery_address: {type: String, required: true,default:"OM"}
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
