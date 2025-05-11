import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const TrendingSearch = ({ onTagClick }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagsFromUrl = params.get("tags");
    if (tagsFromUrl) {
      setSelectedTags(tagsFromUrl.split(","));
    }
  }, [location.search]);

  const { data: trendingTags, isLoading: tagsLoading } = useQuery({
    queryKey: ["trendingTags"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/posts/tags");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    },
  });

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) => {
      const updatedTags = prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag];

      navigate(`/?tags=${updatedTags.join(",")}`);
      onTagClick(updatedTags.join(","));
      return updatedTags;
    });
  };

  const handleClearSearch = () => {
    setSelectedTags([]);
    onTagClick("");
    navigate(`/`);
  };

  return (
    <Card className="h-[calc(100vh-90px)] md:w-1/3 mx-2 hidden md:block sticky top-[64px] mt-2 shadow-lg">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold uppercase tracking-wide">
          Trending Tags
        </h2>
        {selectedTags.length > 0 && (
          <Button onClick={handleClearSearch} size="sm" variant="secondary">
            Clear
          </Button>
        )}
      </div>
      <Separator />
      <div className="p-4 space-y-2">
        {tagsLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : trendingTags ? (
          trendingTags.tags.map((tag) => (
            <p
              key={tag._id}
              onClick={() => handleTagClick(tag._id)}
              className={`p-2 rounded-md cursor-pointer transition-all duration-300 text-sm font-medium ${
                selectedTags.includes(tag._id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              #{tag._id}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground">No Tags to be Found</p>
        )}
      </div>
    </Card>
  );
};

export default TrendingSearch;
