const mongoose = require("mongoose");

// Model DB
const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
