import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import UserPostSection from "../components/UserPostSection";
import TrendingSearch from "../components/TrendingSearch";

const UserPage = () => {

    const { userId } = useParams();

  return (
    <main>
      <Navbar />
      <div className="flex">
        <UserPostSection userId={userId} />
        <TrendingSearch />
      </div>
      
    </main>
  );
};

export default UserPage;
