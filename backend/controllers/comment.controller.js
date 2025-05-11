import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
export const createComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { commentContent } = req.body;
    if (!commentContent && commentContent.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = new Comment({
      commentContent,
      commenter: req.user._id,
      parentPost: postId,
    });
    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id).populate(
      "commenter"
    );
    post.comments.push(savedComment._id);
    await post.save();
    res.status(200).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.commenter.toString() !== userId.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const post = await Post.findById(comment.parentPost);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.pull(commentId);
    await post.save();
    await Comment.deleteMany({ parentComment: commentId });
    const parentComment = await Comment.findById(comment.parentComment);
    if (parentComment) {
      parentComment.replies.pull(commentId);
      await parentComment.save();
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    const { commentContent } = req.body;
    if (!commentContent && commentContent.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.commenter.toString() !== userId.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        commentContent,
      },
      { new: true }
    );
    res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }
    const post = await Post.findById(postId).populate({
      path: "comments",
      populate: {
        path: "commenter",
        select: "username profilePic",
      },
    }).populate({
      path: "comments",
      populate: {
        path: "replies",
        populate: {
          path: "commenter",
          select: "username profilePic",
        },
      },
    })
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post) {
      res.status(200).json({
        comments: post.comments,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const comment = await Comment.findById(commentId).populate({
      path: "commenter",
      select: "username profilePic",
    });
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    if (comment) {
      res.status(200).json({
        comment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const upvoteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.upvote.includes(userId)) {
      return res.status(400).json({
        message: "You have already upvoted this comment",
      });
    }

    comment.upvote.push(userId);
    if (comment.downvote.includes(userId)) {
      comment.downvote.pull(userId);
    }
    await comment.save();

    return res.status(200).json({
      message: "Comment upvoted successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteUpvote = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.upvote.pull(userId);
    await comment.save();

    return res.status(200).json({
      message: "Upvote removed successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const downvoteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.downvote.push(userId);

    if (comment.upvote.includes(userId)) {
      comment.upvote.pull(userId);
    }

    await comment.save();

    return res.status(200).json({
      message: "Comment downvoted successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteDownvote = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.downvote.pull(userId);
    await comment.save();

    return res.status(200).json({
      message: "Downvote removed successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createReply = async (req, res) => {
  try {
    const parentCommentId = req.params.commentId;

    if (!mongoose.isValidObjectId(parentCommentId)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const comment = await Comment.findById(parentCommentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    const parentPostId = comment.parentPost;
    const newReply = new Comment({
      commenter: req.user._id,
      parentComment: parentCommentId,
      commentContent: req.body.commentContent,
      parentPost: parentPostId,
    });

    comment.replies.push(newReply._id);
    await comment.save();
    await newReply.save();

    return res.status(200).json({
      message: "Comment replied successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
