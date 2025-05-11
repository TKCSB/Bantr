import React from 'react'
import Navbar from '../components/Navbar'
import TrendingSearch from '../components/TrendingSearch'
import EditUserProfile from '@/components/EditUserProfile';

const EditProfile = () => {
  return (
    <main>
      <Navbar />
      <div className="flex">
        <EditUserProfile />
        <TrendingSearch />
      </div>
    </main>
  );
}

export default EditProfile