import React from 'react';
import { useLocation, Link } from 'react-router-dom';
// CORRECTED IMPORT: We are now using a named import for QRCodeSVG
import { QRCodeSVG } from 'qrcode.react'; 
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const location = useLocation();
  // THE FIX: We get 'orderId' directly from the state, not 'orderDetails'
  const orderId = location.state?.orderId;

  if (!orderId) {
    return (
        <div className="order-success-container">
            <h2>Oops! Something went wrong.</h2>
            <p>We couldn't find your order details.</p>
            <Link to="/" className="back-to-menu-btn">Back to Menu</Link>
        </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-checkmark">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p>Show this QR code at the counter to collect your items.</p>
      <div className="qr-code-container">
        {/* The QR code's value is now correctly set to the orderId */}
        <QRCodeSVG value={orderId} size={256} />
      </div>
      <p className="order-id-text">Order ID: {orderId}</p>
      <Link to="/" className="back-to-menu-btn">Place Another Order</Link>
    </div>
  );
}

export default OrderSuccessPage;

