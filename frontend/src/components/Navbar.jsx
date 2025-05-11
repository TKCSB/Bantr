import React, { useState, useEffect } from "react";
import { Search, Plus, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useThemeStore from "@/stores/themeStore";

const Navbar = ({ onSearch }) => {
  const queryClient = useQueryClient();
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode, setDarkMode } = useThemeStore();
  const { toast } = useToast();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/users/get-user");
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleLogout = async () => {
    const response = await axiosInstance.get(
      "/users/logout",
      {},
      {
        withCredentials: true,
      }
    );
    if (response.status === 200) {
      toast({
        title: "Success",
        description: response.data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value.trim());
  };

  const randomAvatarUrl = `https://robohash.org/${
    authUser?.username || "default"
  }?set=set2&size=50x50`;

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <nav
      className={`p-4 shadow-md sticky top-0 z-30 bg-background transition-all duration-300 border-b`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <Link
          to={"/"}
          className="flex items-center space-x-2 text-xl font-bold flex-shrink-0"
        >
          <img src="/nav.png" alt="Logo" className="h-10" />
          <span className="hidden sm:block">Bantr</span>
        </Link>

        {/* Search Bar and User Actions */}
        <div className="flex items-center space-x-4 w-full justify-end md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className={`w-full px-4 py-2 pl-4 pr-10 rounded-lg shadow-sm transition-all duration-300 ${
                isFocused ? "focus:ring-2 focus:ring-0077b6" : "focus:ring-0"
              }`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search"
            />
            <Search
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300`}
              size={20}
            />
          </div>

          {/* Dark Mode Toggle */}
          <Button onClick={toggleDarkMode} className="p-2 size-10 rounded-full">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {/* Login Button or Profile Dropdown */}
          <div className="relative">
            {authUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center px-1 py-1 rounded-full hover:bg-gray-700 focus:outline-none bg-inherit">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.profilePic} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="absolute right-0 mt-2 w-64 rounded-lg shadow-md z-40">
                  {/* Profile Option */}
                  <DropdownMenuItem
                    className="flex flex-col items-start px-4 py-2 cursor-pointer"
                    onClick={() => navigate(`/user/${user?._id}`)}
                  >
                    <div className="flex items-center mb-1">
                      <img
                        src={user?.profilePic}
                        alt="User Avatar"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span>{user?.username}</span>
                    </div>
                    <span className="text-sm">View Profile</span>
                  </DropdownMenuItem>

                  {/* Create Option */}
                  <div className="block md:hidden">
                    <Link
                      to="/create"
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                    >
                      <Plus size={16} className="mr-2" />
                      <span>Create</span>
                    </Link>
                  </div>
                  <DropdownMenuItem
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => navigate("/edit-profile")}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  {/* Logout */}
                  <DropdownMenuItem
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 bg-chart-4"
              >
                Login
              </Link>
            )}
          </div>

          {/* Create Button for Desktop */}
          {authUser && (
            <div className="hidden md:block">
              <Link
                to="/create"
                className={`flex items-center px-4 py-2 ${
                  darkMode
                    ? "hover:bg-white hover:text-black border-white"
                    : "hover:bg-white hover:text-black border-black"
                } rounded-lg shadow-md focus:outline-none focus:ring-2 transition-all duration-300 border `}
              >
                <Plus size={16} className="mr-2" />
                Create
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
