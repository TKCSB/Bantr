import express from "express";
import { checkLoggedIn } from "../middlewares/checkLoggedIn.middleware.js";
import { createComment, deleteComment, updateComment, getAllComments, getComment, upvoteComment, deleteUpvote, downvoteComment, deleteDownvote, createReply } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/:postId", checkLoggedIn, createComment);
router.delete("/:commentId", checkLoggedIn, deleteComment);
router.patch("/:commentId", checkLoggedIn, updateComment);
router.get("/get-all-comments/:postId", getAllComments);
router.get("/get-comment/:commentId", getComment);
router.post("/upvote/:commentId", checkLoggedIn, upvoteComment);
router.delete("/delete-upvote/:commentId", checkLoggedIn, deleteUpvote);
router.post("/downvote/:commentId", checkLoggedIn, downvoteComment);
router.delete("/delete-downvote/:commentId", checkLoggedIn, deleteDownvote);
router.post("/:commentId/reply", checkLoggedIn, createReply);

export default router;
