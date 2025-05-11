import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentContent: {
      type: String,
      required: true,
    },
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      }
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
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
