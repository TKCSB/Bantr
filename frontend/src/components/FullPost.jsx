import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MessageSquare, Share2 } from "lucide-react";
import useVoteStore from "@/stores/voteStore";
import { useToast } from "@/hooks/use-toast";
import useCommentVoteStore from "@/stores/commentVoteStore";

const FullPost = ({ postId }) => {
  const [comment, setComment] = useState("");
  const [commentFocused, setCommentFocused] = useState(false);

  const [replyTabOpen, setReplyTabOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [replyFocused, setReplyFocused] = useState(false);

  const queryClient = useQueryClient();

  const {
    commentVotes,
    commentVoteStatus,
    setCommentVotes,
    setCommentVoteStatus,
  } = useCommentVoteStore();
  const [isCommentVoting, setIsCommentVoting] = useState(false);

  const { toast } = useToast();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: postFetch, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/get-post/${postId}`);
      return response.data.post;
    },
  });

  const { mutate: createComment, isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(`/comments/${postId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const { mutate: createReply, isLoading: replyLoading } = useMutation({
    mutationFn: async ({ commentContent, commentId }) => {
      const response = await axiosInstance.post(
        `/comments/${commentId}/reply`,
        { commentContent }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
    },
  });

  const { data: commentsFetch, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/comments/get-all-comments/${postId}`
      );
      return response.data.comments || [];
    },
  });

  const { votes, voteStatus, setVotes, setVoteStatus } = useVoteStore();
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (authUser && postFetch) {
      setVoteStatus(
        postId,
        postFetch.upvote.includes(authUser._id),
        postFetch.downvote.includes(authUser._id)
      );
    }
    if (postFetch) {
      setVotes(postId, postFetch.upvote.length, postFetch.downvote.length);
    }
    if (authUser && commentsFetch) {
      commentsFetch.forEach((comment) => {
        setCommentVoteStatus(
          comment._id,
          comment.upvote.includes(authUser._id),
          comment.downvote.includes(authUser._id)
        );
        setCommentVotes(
          comment._id,
          comment.upvote.length,
          comment.downvote.length
        );

        comment.replies.forEach((reply) => {
          setCommentVoteStatus(
            reply._id,
            reply.upvote.includes(authUser._id),
            reply.downvote.includes(authUser._id)
          );
          setCommentVotes(
            reply._id,
            reply.upvote.length,
            reply.downvote.length
          );
        });
      });
    }
  }, [
    authUser,
    postFetch,
    commentsFetch,
    setCommentVoteStatus,
    setCommentVotes,
    setVoteStatus,
    postId,
  ]);

  const voteMutation = useMutation({
    queryKey: ["vote"],
    mutationFn: async ({ action, voteType }) => {
      setIsVoting(true);
      if (action === "add") {
        await axiosInstance.post(`/posts/${voteType}/${postId}`);
      } else {
        await axiosInstance.delete(`/posts/delete-${voteType}/${postId}`);
      }
    },
    onSuccess: (_, { action, voteType }) => {
      queryClient.invalidateQueries(["posts"]);
      const isUpvote = voteType === "upvote";
      const isCurrentlyVoted = isUpvote
        ? voteStatus[postId]?.isUpvoted
        : voteStatus[postId]?.isDownvoted;

      setVoteStatus(
        postId,
        isUpvote ? !isCurrentlyVoted : voteStatus[postId]?.isUpvoted,
        isUpvote ? voteStatus[postId]?.isDownvoted : !isCurrentlyVoted
      );
      setVotes(
        postId,
        votes[postId].upvote + (isUpvote ? (action === "add" ? 1 : -1) : 0),
        votes[postId].downvote + (!isUpvote ? (action === "add" ? 1 : -1) : 0)
      );
      setIsVoting(false);
    },
    onError: () => {
      setIsVoting(false);
    },
  });

  const handleVote = (voteType) => {
    if (!authUser) {
      toast({
        description: "You need to be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    const isCurrentlyVoted =
      voteType === "upvote"
        ? voteStatus[postId]?.isUpvoted
        : voteStatus[postId]?.isDownvoted;
    const action = isCurrentlyVoted ? "remove" : "add";

    voteMutation.mutate({ action, voteType });
  };

  const commentVoteMutation = useMutation({
    mutationFn: async ({ id, action, voteType }) => {
      setIsCommentVoting(true);
      if (action === "add") {
        await axiosInstance.post(`/comments/${voteType}/${id}`);
      } else {
        await axiosInstance.delete(`/comments/delete-${voteType}/${id}`);
      }
    },
    onSuccess: (_, { id, action, voteType }) => {
      queryClient.invalidateQueries(["comments", postId]);
      const isUpvote = voteType === "upvote";
      const isCurrentlyVoted = isUpvote
        ? commentVoteStatus[id]?.isUpvoted
        : commentVoteStatus[id]?.isDownvoted;

      setCommentVoteStatus(
        id,
        isUpvote ? !isCurrentlyVoted : commentVoteStatus[id]?.isUpvoted,
        isUpvote ? commentVoteStatus[id]?.isDownvoted : !isCurrentlyVoted
      );
      setCommentVotes(
        id,
        commentVotes[id]?.upvote + (isUpvote ? (action === "add" ? 1 : -1) : 0),
        commentVotes[id]?.downvote +
          (!isUpvote ? (action === "add" ? 1 : -1) : 0)
      );

      toast.success(
        `${voteType === "upvote" ? "Upvoted" : "Downvoted"} successfully`
      );
      setIsCommentVoting(false);
    },
    onError: () => {
      setIsCommentVoting(false);
      toast.error("Failed to vote. Please try again.");
    },
  });

  const handleCommentVote = (id, voteType) => {
    if (!authUser) {
      toast({
        description: "You need to be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    if (isCommentVoting) return;

    const isCurrentlyVoted =
      voteType === "upvote"
        ? commentVoteStatus[id]?.isUpvoted
        : commentVoteStatus[id]?.isDownvoted;
    const action = isCurrentlyVoted ? "remove" : "add";

    commentVoteMutation.mutate({ id, action, voteType });
  };

  const handleComment = (event) => {
    event.preventDefault();

    if (comment.trim() === "") {
      return;
    }

    createComment({ commentContent: comment });
    setComment("");
    setCommentFocused(false);
  };

  const handleReply = (event, commentId) => {
    event.preventDefault();

    if (reply.trim() === "") {
      return;
    }

    createReply({ commentContent: reply, commentId });
    setReply("");
    setReplyFocused(false);
  };

  const handleReplyTab = (commentId) => {
    if (replyTabOpen === commentId) {
      setReplyTabOpen(null);
    } else {
      setReplyTabOpen(commentId);
    }
  };

  if (postLoading || commentsLoading) {
    return (
      <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center p-6 rounded-lg">
        <div className="text-lg font-semibold text-foreground">Loading...</div>
      </Card>
    );
  }

  return (
    <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center p-6 rounded-lg">
      {postFetch && (
        <div className="w-full mb-8 text-center">
          <div className="flex items-center gap-4 mb-4">
            <Avatar>
              <AvatarImage
                src={postFetch.author.profilePic}
                alt="Profile"
                className="size-9 rounded-full border-2 border-muted"
              />
            </Avatar>
            <div className="text-left">
              <h2 className="text-sm font-medium text-muted-foreground">
                {postFetch.author.username}
              </h2>
              <h1 className="text-4xl font-extrabold text-foreground">
                {postFetch.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {formatDistanceToNow(postFetch.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="text-lg text-foreground leading-relaxed text-justify">
            {postFetch.content}
          </p>
          {postFetch.image && (
            <img
              src={postFetch.image}
              alt="Random Post"
              className="w-full rounded-lg mb-6 border border-muted shadow-md h-[50vh] object-cover"
            />
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={isVoting}
                onClick={(e) => {
                  handleVote("upvote");
                }}
                className="hover:bg-transparent"
              >
                <ArrowUp
                  size={20}
                  className={
                    voteStatus[postId]?.isUpvoted ? "text-chart-5" : ""
                  }
                />
                <span>{votes[postId]?.upvote || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={isVoting}
                onClick={(e) => {
                  handleVote("downvote");
                }}
                className="hover:bg-transparent"
              >
                <ArrowDown
                  size={20}
                  className={
                    voteStatus[postId]?.isDownvoted ? "text-chart-4" : ""
                  }
                />
                <span>{votes[postId]?.downvote || 0}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
            >
              <MessageSquare size={20} /> {postFetch.comments.length}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      )}

      {authUser && (
        <Card className="w-full p-4 bg-card rounded-lg shadow-md flex gap-2">
          <Avatar>
            <AvatarImage
              src={authUser.profilePic}
              alt="Profile"
              className="w-12 rounded-full border border-muted"
            />
          </Avatar>
          <form
            onSubmit={handleComment}
            className="flex-1 flex items-center gap-4"
          >
            <Input
              placeholder="Add a comment..."
              className="w-full border-b-2 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              onFocus={() => setCommentFocused(true)}
              onBlur={() => setCommentFocused(false)}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {commentFocused && (
              <div className="flex items-center gap-2">
                <Button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setComment("");
                    setCommentFocused(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                >
                  Post
                </Button>
              </div>
            )}
          </form>
        </Card>
      )}
      {commentsFetch?.length > 0 ? (
        <div className="w-full mt-8">
          <h2 className="text-3xl font-bold mb-6 border-b border-muted pb-2 text-foreground">
            Comments
          </h2>
          <div className="space-y-6">
            {commentsFetch.map((comment) => (
              <Card
                key={comment._id}
                className="p-5 bg-card rounded-lg shadow-md"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Avatar>
                    <AvatarImage
                      src={comment.commenter.profilePic}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border border-muted"
                    />
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {comment.commenter.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </p>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">
                  {comment.commentContent}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isCommentVoting}
                    onClick={() => handleCommentVote(comment._id, "upvote")}
                    className="hover:bg-transparent"
                  >
                    <ArrowUp
                      size={20}
                      className={
                        commentVoteStatus[comment._id]?.isUpvoted
                          ? "text-chart-5"
                          : ""
                      }
                    />
                    <span>{commentVotes[comment._id]?.upvote || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isCommentVoting}
                    onClick={() => handleCommentVote(comment._id, "downvote")}
                    className="hover:bg-transparent"
                  >
                    <ArrowDown
                      size={20}
                      className={
                        commentVoteStatus[comment._id]?.isDownvoted
                          ? "text-chart-4"
                          : ""
                      }
                    />
                    <span>{commentVotes[comment._id]?.downvote || 0}</span>
                  </Button>
                  <Button
                    className="flex justify-end hover:bg-transparent text-sm"
                    variant="ghost"
                    onClick={() => {
                      handleReplyTab(comment._id);
                    }}
                  >
                    Reply
                    <ArrowDown size={20} />({comment.replies.length})
                  </Button>
                </div>
                {replyTabOpen === comment._id && (
                  <div className="ml-10 mt-4 border-l-2 border-muted pl-4">
                    {authUser && (
                      <form
                        onSubmit={(e) => {
                          handleReply(e, comment._id);
                        }}
                      >
                        <Input
                          placeholder="Add a reply..."
                          className="w-full border-b-2 border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none mb-2"
                          onFocus={() => setReplyFocused(true)}
                          onBlur={() => setReplyFocused(false)}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                        />
                        {replyFocused && (
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <Button
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setReply("");
                                setReplyFocused(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                            >
                              Post
                            </Button>
                          </div>
                        )}
                      </form>
                    )}
                    <div className="space-y-4">
                      {comment.replies.map((reply) => (
                        <Card
                          key={reply._id}
                          className="p-4 bg-card rounded-md shadow-md border border-muted"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar>
                              <AvatarImage
                                src={reply.commenter.profilePic}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border border-muted"
                              />
                            </Avatar>
                            <div>
                              <p className="text-md font-medium text-foreground">
                                {reply.commenter.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.createdAt))}{" "}
                                ago
                              </p>
                            </div>
                          </div>
                          <p className="text-foreground">
                            {reply.commentContent}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isCommentVoting}
                              onClick={() =>
                                handleCommentVote(reply._id, "upvote")
                              }
                              className="hover:bg-transparent"
                            >
                              <ArrowUp
                                size={16}
                                className={
                                  commentVoteStatus[reply._id]?.isUpvoted
                                    ? "text-chart-5"
                                    : ""
                                }
                              />
                              <span>
                                {commentVotes[reply._id]?.upvote || 0}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isCommentVoting}
                              onClick={() =>
                                handleCommentVote(reply._id, "downvote")
                              }
                              className="hover:bg-transparent"
                            >
                              <ArrowDown
                                size={16}
                                className={
                                  commentVoteStatus[reply._id]?.isDownvoted
                                    ? "text-chart-4"
                                    : ""
                                }
                              />
                              <span>
                                {commentVotes[reply._id]?.downvote || 0}
                              </span>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full mt-8 text-center">
          <h2 className="text-3xl font-bold">No comments yet</h2>
        </div>
      )}
    </Card>
  );
};

export default FullPost;
