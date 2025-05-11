import mongoose from "mongoose";

const postScheme = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    image: {
      type: String,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length <= 10; 
        },
        message: "You can only add a maximum of 10 tags.",
      },
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    upvote: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvote: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", postScheme);
