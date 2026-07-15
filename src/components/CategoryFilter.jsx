import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <nav className="category-nav">
      <h3>Categories</h3>
      <ul>
        {categories.map(category => (
          <li
            key={category}
            className={category === selectedCategory ? 'active' : ''}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryFilter;