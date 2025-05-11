import { create } from "zustand";

const useVoteStore = create((set) => ({
  votes: {}, // Stores upvote and downvote counts for each post by postId
  voteStatus: {}, // Stores upvote and downvote status for each post by postId
  setVotes: (postId, upvoteCount, downvoteCount) =>
    set((state) => ({
      votes: {
        ...state.votes,
        [postId]: { upvote: upvoteCount, downvote: downvoteCount },
      },
    })),
  setVoteStatus: (postId, isUpvoted, isDownvoted) =>
    set((state) => ({
      voteStatus: {
        ...state.voteStatus,
        [postId]: { isUpvoted, isDownvoted },
      },
    })),
}));

export default useVoteStore;
