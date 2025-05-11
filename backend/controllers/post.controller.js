import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { title, content,image, tags } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!tags || tags.length > 10 || tags.length === 0) {
      return res.status(400).json({
        message: "Tags condition not satisfied",
      });
    }
    let newPost;

    if (image) {
      const result = await cloudinary.uploader.upload(image);
       newPost = new Post({
      title,
      author: req.user._id,
      content,
      image: result.secure_url,
      tags,
    });
  } else {
     newPost = new Post({
      title,
      author: req.user._id,
      content,
      tags,
    });
  }

    const savedPost = await newPost.save();

    const populatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "username profilePic"
    );
    console.log(populatedPost);

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (req.user._id.toString() !== post.author.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    await Comment.deleteMany({ parentPost: postId });
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content,image, tags } = req.body;

    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (req.user._id.toString() !== post.author.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (image && post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    const updatePost = await Post.findByIdAndUpdate(
      postId,
      { title, content, image, tags },
      { new: true }
    );

    res.status(200).json({
      message: "Post updated successfully",
      post: updatePost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId)
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        select: "commentContent commenter",
        populate: {
          path: "commenter",
          select: "username profilePic",
        },
      });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllPostsbyUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        message: "User id not given",
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        select: "commentContent commenter",
        populate: {
          path: "commenter",
          select: "username profilePic",
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!posts) {
      return res.status(404).json({
        message: "Posts not found",
      });
    }

    const totalPosts = await Post.countDocuments({ author: userId });

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      isLastPage: page * limit >= totalPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get tags from query, if any
    const tags = req.query.tags ? req.query.tags.split(",") : [];

    let query = {};
    if (tags.length > 0) {
      const tagPatterns = tags.map((tag) => new RegExp(tag.trim(), "i"));
      query = { tags: { $all: tagPatterns } };
    }

    const posts = await Post.find(query)
      .populate("author", "username profilePic")
      .populate({
        path: "comments",
        select: "commentContent commenter",
        populate: {
          path: "commenter",
          select: "username profilePic",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      isLastPage: page * limit >= totalPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSearchResult = async (req, res) => {
  try {
    const tagQuery = req.query.tag;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!tagQuery) {
      return res.status(400).json({
        message: "Tag not given",
      });
    }

    const tags = tagQuery.split(/\s+/); 

    const regexSearch = tags.map((tag) => ({
      tags: { $regex: tag, $options: "i" },
    }));

    const posts = await Post.find({
      $and: regexSearch,
    }).populate("author", "username profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!posts) {
      return res.status(404).json({
        message: "Posts not found",
      });
    }
    

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      isLastPage: page * limit >= totalPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const upvotePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.upvote.includes(userId)) {
      return res.status(400).json({
        message: "You have already upvoted this post",
      });
    }

    post.upvote.push(userId);
    if (post.downvote.includes(userId)) {
      post.downvote.pull(userId);
    }
    await post.save();

    res.status(200).json({
      message: "Post upvoted successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteUpvote = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (!post.upvote.includes(userId)) {
      return res.status(400).json({
        message: "You have not upvoted this post",
      });
    }

    post.upvote.pull(userId);
    await post.save();

    res.status(200).json({
      message: "Post upvote deleted successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const downvotePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.downvote.includes(userId)) {
      return res.status(400).json({
        message: "You have already downvoted this post",
      });
    }

    post.downvote.push(userId);
    if (post.upvote.includes(userId)) {
      post.upvote.pull(userId);
    }
    await post.save();

    res.status(200).json({
      message: "Post downvoted successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteDownvote = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (!post.downvote.includes(userId)) {
      return res.status(400).json({
        message: "You have not downvoted this post",
      });
    }

    post.downvote.pull(userId);
    await post.save();

    res.status(200).json({
      message: "Post downvote deleted successfully",
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const upvoteCount = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const upvoteCount = post.upvote.length;

    res.status(200).json({
      upvoteCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const downvoteCount = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({
        message: "Post id not given",
      });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const downvoteCount = post.downvote.length;

    res.status(200).json({
      downvoteCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMostPopularTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).limit(10);

    if (!tags) {
      return res.status(404).json({
        message: "No tags found",
      });
    }

    res.status(200).json({
      message: "Most popular tags fetched successfully",
      tags,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
