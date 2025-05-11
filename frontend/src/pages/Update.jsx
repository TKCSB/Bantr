import React from 'react'
import Navbar from '../components/Navbar'
import UpdatePost from '../components/UpdatePost'
import TrendingSearch from '../components/TrendingSearch'
import { useParams } from 'react-router-dom'
const Update = () => {

  const {postId} = useParams();

  return (
    <main>
      <Navbar />
      <div className="flex">
        <UpdatePost postId={postId}/>
        <TrendingSearch />
      </div>
    </main>
  );
}

export default Update