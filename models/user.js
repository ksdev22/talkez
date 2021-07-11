const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contacts: [
    {
      id: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      messages: {
        type: String,
        required: true,
      },
    },
  ],
  contactAddRequests: [
    {
      id: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
