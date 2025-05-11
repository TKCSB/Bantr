import express from "express";
import { checkLoggedIn } from "../middlewares/checkLoggedIn.middleware.js";
import {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getAllPostsbyUser,
  getAllPosts,
  getSearchResult,
  upvotePost,
  deleteUpvote,
  downvotePost,
  deleteDownvote,
  upvoteCount,
  downvoteCount,
  getMostPopularTags,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/", checkLoggedIn, createPost);
router.delete("/:postId", checkLoggedIn, deletePost);
router.patch("/:postId", checkLoggedIn, updatePost);
router.get("/get-post/:postId", getPost);
router.get("/get-all-posts-by-user/:userId", getAllPostsbyUser);
router.get("/get-all-posts", getAllPosts);
router.get("/search", getSearchResult);
router.post("/upvote/:postId", checkLoggedIn, upvotePost);
router.delete("/delete-upvote/:postId", checkLoggedIn, deleteUpvote);
router.post("/downvote/:postId", checkLoggedIn, downvotePost);
router.delete("/delete-downvote/:postId", checkLoggedIn, deleteDownvote);
router.get("/upvote-count/:postId", upvoteCount);
router.get("/downvote-count/:postId", downvoteCount);
router.get("/tags", getMostPopularTags)

export default router;
