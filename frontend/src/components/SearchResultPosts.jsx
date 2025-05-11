import React, { useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import PostCardSkeleton from "./skeletons/PostCardSkeleton";
import PostCard from "./PostCard";
import { axiosInstance } from "../lib/axios";

const SearchResultPosts = () => {
  const observerRef = useRef(null);
  const queryClient = useQueryClient();
  // Get the query parameters from the URL using useLocation
  const { search } = useLocation();
  const tag = new URLSearchParams(search).get("tag"); // Extract the tag from query params

  const {
    data: tagPosts,
    isLoading: postsLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tagPosts", tag], // Include the tag in the query key
    queryFn: async ({ pageParam = 1 }) => {
      if (!tag) return { posts: [], isLastPage: true }; // No data if no tag is selected
      const response = await axiosInstance.get(
        `/posts/search?tag=${tag}&page=${pageParam}`
      );
      return {
        posts: response.data.posts,
        nextPage: pageParam + 1,
        isLastPage: response.data.isLastPage,
      };
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    getNextPageParam: (lastPage) =>
      lastPage.isLastPage ? undefined : lastPage.nextPage,
    enabled: !!tag, // Only fetch if a tag is selected
  });


  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (postsLoading) {
    return (
      <section className="min-h-screen w-full md:w-2/3 bg-black backdrop-blur-md bg-opacity-30 border border-gray-300 mx-2 overflow-auto mt-2 flex flex-col items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (isError || !tagPosts) {
    return (
      <section className="min-h-screen w-full md:w-2/3 bg-black backdrop-blur-md bg-opacity-30 border border-gray-300 mx-2 overflow-auto mt-2 flex flex-col items-center">
        <p>No posts to display for {tag}</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full md:w-2/3 bg-black backdrop-blur-md bg-opacity-30 border border-gray-300 mx-2 overflow-auto mt-2 flex flex-col items-center">
      {tagPosts.pages.map((page, index) => (
        <div key={index}>
          {page.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ))}
      <div ref={observerRef} className="h-10" />
    </section>
  );
};

export default SearchResultPosts;
