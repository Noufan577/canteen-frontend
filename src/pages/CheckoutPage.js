import React from 'react';
import { useLocation } from 'react-router-dom';
import './CheckoutPage.css';

function CheckoutPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  if (!orderDetails) {
    return <div>Loading order details...</div>;
  }

  return (
    <div className="checkout-container">
      <h2>Order Summary</h2>
      <div className="order-details">
        <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
        <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount}</p>
        <h3>Items:</h3>
        <ul>
          {orderDetails.items.map((item, index) => (
            <li key={index}>
              {item.name} (x{item.quantity}) - ₹{item.price * item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <button className="payment-btn">Pay Now with UPI</button>
    </div>
  );
}

export default CheckoutPage;