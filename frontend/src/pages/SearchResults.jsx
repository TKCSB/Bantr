import React from 'react'
import SearchResultPosts from '../components/SearchResultPosts';
import TrendingSearch from '../components/TrendingSearch';
import Navbar from '../components/Navbar';

const SearchResults = () => {
  return (
    <main>
      <Navbar />
      <div className="flex">
        <SearchResultPosts />
        <TrendingSearch />
      </div>
    </main>
  );
}

export default SearchResults