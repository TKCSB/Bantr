import React, { useEffect, useRef } from "react";
import PostCard from "./PostCard";
import { axiosInstance } from "../lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCardSkeleton from "./skeletons/PostCardSkeleton";
import { Card } from "@/components/ui/card";


const UserPostSection = ({ userId }) => {
  const observerRef = useRef(null);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(
        `/posts/get-all-posts-by-user/${userId}?page=${pageParam}`
      );
      return {
        posts: response.data.posts,
        nextPage: pageParam + 1,
        isLastPage: response.data.isLastPage,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.isLastPage ? undefined : lastPage.nextPage;
    },
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

  if (isLoading) {
    return (
      <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="min-h-[calc(100vh-58px)] w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center">
        <p className="text-foreground">No posts to display.</p>
      </Card>
    );
  }

  return (
    <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center ">
      {data && data.pages && data.pages.length > 0 ? (
        data.pages.map((page) =>
          page.posts.map((post) => <PostCard key={post._id} post={post} />)
        )
      ) : (
        <p className="text-center text-white">No posts to display.</p>
      )}
      {isFetchingNextPage && <p>Loading more posts...</p>}
      <div ref={observerRef} className="h-10" />
    </Card>
  );
};

export default UserPostSection;
