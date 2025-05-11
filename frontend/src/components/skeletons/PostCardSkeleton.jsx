import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <Card className="animate-pulse w-[95%] mx-2 my-4 p-4 space-y-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      {/* Title Skeleton */}
      <Skeleton className="w-full h-8 rounded" />

      {/* Tags Skeleton */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-16 h-6 rounded-md" />
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-6 h-4 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-4 rounded" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </Card>
  );
};

export default PostCardSkeleton;
