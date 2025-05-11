import { useQueryClient, useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Image, Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState("");
  const [words, setWords] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createPost, isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post("/posts", data);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Post created successfully." });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
    onError: (error) => {
      toast({ title: "Uh oh!", description: error.response.data.message });
    },
  });

  const handleCreation = (event) => {
    event.preventDefault();
    if (!title || !content || tags.length === 0) {
      toast({ title: "Error", description: "Please fill in all fields." });
      return;
    }
    const postData = { title, content, tags };
    if (image) {
      readFileAsDataURL(image).then((dataUrl) => {
        postData.image = dataUrl;
        createPost(postData);
      });
    } else {
      createPost(postData);
    }
  };

  const handleSetTags = (event) => {
    if (
      (event.key === " " || event.nativeEvent.inputType === "insertText") &&
      tag.trim()
    ) {
      setTags([...tags, tag.trim()]);
      setTag("");
    } else if (event.key === "Backspace" && tag === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const addTag = () => {
    if (tag.trim()) {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Card className="min-h-screen w-full md:w-2/3 border mx-2 overflow-auto mt-2 flex flex-col transition-all duration-300">
      <CardContent className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4">
            Create a Post
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleCreation} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Title"
              value={title}
              maxLength={300}
              onChange={(e) => {
                setTitle(e.target.value);
                setWords(e.target.value.length);
              }}
              className="w-full p-7 bg-background border-input focus:ring-ring"
            />
          </div>
          <p className="text-sm font-medium self-end">{words}/300</p>
          <div className="relative">
            <Textarea
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full p-3 bg-background border-input focus:ring-ring"
            />
            {imagePreview && (
              <div className="relative w-full flex justify-center mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-1/2 h-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <label className="absolute bottom-2 right-2 cursor-pointer">
              <Image size={24} />
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div>
            <Label className="block mb-1 text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-3 px-3 py-1 text-sm font-medium"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Input
                type="text"
                placeholder="Add a tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleSetTags}
                className="p-2 bg-background border-input focus:ring-ring"
              />
              <Button type="button" onClick={addTag} className="ml-2">
                Add Tag
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-[20%] self-end"
          >
            {isLoading ? <Loader className="animate-spin" /> : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
