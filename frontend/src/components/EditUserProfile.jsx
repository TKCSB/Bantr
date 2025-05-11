import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@/hooks/use-toast";

const EditUserProfile = () => {
  const [avatar, setAvatar] = useState("");

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["user"],
  });


  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.patch("users/edit-user", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setAvatar("");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
      });
      setAvatar("");
    },
  });

  const handleAvatarClick = (event) => {
    if(avatar === event.target.src){
      setAvatar("");
      return;
    }
    setAvatar(event.target.src);
  };

  const handleSaveChanges = (event) => {
    event.preventDefault();
    if (!avatar) {
      return;
    }
    updateUser({ profilePic: avatar });
  };

  return (
    <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Edit User Profile</h1>
      <div className="w-full flex flex-col items-center mb-6">
        <h2 className="text-2xl font-semibold mb-4">Avatar Store</h2>
        <div className="w-full flex justify-center gap-4 mb-6">
          {[
            "https://res.cloudinary.com/demcb8sqp/image/upload/v1739027834/female-avatar_wwc8i5.jpg",
            "https://res.cloudinary.com/demcb8sqp/image/upload/v1739027835/male-avatar_mtx1zm.jpg",
          ].map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Avatar ${index + 1}`}
              className={`w-24 h-24 rounded-full border-2 cursor-pointer transition-all duration-200 
    ${
      user?.profilePic === src
        ? "border-blue-500 pointer-events-none opacity-50"
        : "border-gray-300"
    }`}
             
              onClick={handleAvatarClick}
              style={{
                borderColor: avatar === src ? "blue" : "gray",
                borderWidth: avatar === src ? "3px" : "2px",
              }}
            />
          ))}
        </div>
        <Button
          onClick={handleSaveChanges}
          className="mb-6"
          disabled={isLoading || !avatar}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
};

export default EditUserProfile;
