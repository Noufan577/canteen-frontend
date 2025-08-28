import React from 'react';
import { useLocation } from 'react-router-dom';
// CORRECTED IMPORT: We are now using a named import for QRCodeSVG
import { QRCodeSVG } from 'qrcode.react'; 
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  if (!orderDetails) {
    return <h2>Loading your order... Or order not found.</h2>;
  }

  return (
    <div className="order-success-container">
      <h2>Order Placed Successfully!</h2>
      <p>Show this QR code at the counter to collect your items.</p>
      <div className="qr-code-container">
        {/* Use the imported QRCodeSVG component */}
        <QRCodeSVG value={orderDetails.orderId} size={256} />
      </div>
      <h3>Order ID: {orderDetails.orderId}</h3>
    </div>
  );
}
export default OrderSuccessPage;
