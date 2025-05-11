import React,{useState} from 'react'
import Navbar from '../components/Navbar'
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PostsSection from '../components/PostsSection';
import TrendingSearch from '../components/TrendingSearch';
import { useNavigate} from 'react-router-dom'


const Home = () => {

  const [searchTags, setSearchTags] = useState("");

  return (
    <main>
      <Navbar onSearch={setSearchTags}/>
      <div className="flex">
        {/* Scrollable Section */}
        <PostsSection searchTags={searchTags}/>

        {/* Fixed Section */}
        <TrendingSearch onTagClick={setSearchTags}/>
      </div>
    </main>
  );
}

export default Home