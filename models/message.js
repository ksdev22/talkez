const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = Schema({
  numMessages: {
    type: Number,
    required: true,
  },
  chats: [
    {
      body: {
        type: String,
        required: true,
      },
      sender: {
        type: String,
        required: true,
      },
      rank: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Message", messageSchema);
