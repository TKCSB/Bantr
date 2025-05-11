import {create} from "zustand";

const useCommentVoteStore = create((set) => ({
    commentVotes: {},
    commentVoteStatus: {},
    setCommentVotes: (commentId, upvoteCount, downvoteCount) => set((state) => ({
        commentVotes: {
            ...state.commentVotes,
            [commentId]: {upvote: upvoteCount, downvote: downvoteCount}
        }
    })),
    setCommentVoteStatus: (commentId, isUpvoted, isDownvoted) => set((state) => ({
        commentVoteStatus: {
            ...state.commentVoteStatus,
            [commentId]: {isUpvoted, isDownvoted}
        }
    }))    
}))

export default useCommentVoteStore;