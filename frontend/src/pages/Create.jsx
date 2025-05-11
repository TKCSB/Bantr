import React from 'react'
import Navbar from '../components/Navbar'
import CreatePost from '../components/CreatePost'
import TrendingSearch from '../components/TrendingSearch'

const Create = () => {
  return (
    <main>
      <Navbar />
      <div className="flex">
        <CreatePost />
        <TrendingSearch />
      </div>
    </main>
  );
}

export default Create