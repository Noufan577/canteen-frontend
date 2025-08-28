import React from 'react';
import './Cart.css';

function Cart({ cartItems, handleCheckout, addToCart, decreaseQuantity }) {
  const totalPrice = cartItems.reduce((price, item) => price + item.quantity * item.price, 0);

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="cart-empty-text">Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <span className="item-name">{item.name}</span>
              <div className="quantity-controls">
                <button onClick={() => decreaseQuantity(item)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
              <span className="item-price">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <hr />
          <div className="cart-total">
            <strong>Total: ₹{totalPrice}</strong>
          </div>
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;