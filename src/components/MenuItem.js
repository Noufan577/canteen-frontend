import React from 'react';
import './MenuItem.css';

function MenuItem({ item, addToCart }) {
  const imageUrl = item.imageUrl || 'https://via.placeholder.com/150';
  const isSoldOut = item.quantity <= 0;

  return (
    <div className={`menu-card ${isSoldOut ? 'sold-out' : ''}`}>
      {isSoldOut && <div className="sold-out-overlay">Sold Out</div>}
      <img src={imageUrl} alt={item.name} className="menu-image" />
      <div className="menu-details">
        <h3>{item.name}</h3>
        <p>₹{item.price}</p>
      </div>
      <button 
        className="add-to-cart-btn" 
        onClick={() => addToCart(item)}
        disabled={isSoldOut}
      >
        {isSoldOut ? 'Unavailable' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default MenuItem;
