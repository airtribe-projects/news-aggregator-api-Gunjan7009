const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    preferences: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

// mongoose.exports('User', mongoose.model('User', userSchema));

const User = mongoose.model("User", userSchema);

module.exports = User;
