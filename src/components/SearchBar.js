import React from 'react';
import './SearchBar.css';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search for your favorite food..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;