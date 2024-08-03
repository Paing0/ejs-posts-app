const moongose = require("mongoose");

const { Schema, model } = moongose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
});
module.exports = model("Post", postSchema);
