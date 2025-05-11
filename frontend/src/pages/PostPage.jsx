import React from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar';
import FullPost from '../components/FullPost';
import TrendingSearch from '../components/TrendingSearch';

const PostPage = () => {
    const {postId } = useParams();


  return (
    <main>
        <Navbar />
        <div className='flex'>
            <FullPost postId={postId} />
            <TrendingSearch />
        </div>
    </main>
  )
}

export default PostPage