import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import './StaffScannerPage.css';

function StaffScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!isScanning) return; // Don't run the scanner if we've stopped it

    const scanner = new Html5QrcodeScanner(
      'qr-reader', // The ID of the div to render the scanner in
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5, // Scans per second
      },
      false // verbose = false
    );

    const handleScanSuccess = async (decodedText) => {
      // This function is called when a QR code is successfully scanned
      scanner.clear(); // Stop the camera
      setIsScanning(false);
      const orderId = decodedText;

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/menu`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId })
        });

        const resultData = await response.json();
        if (!response.ok) throw new Error(resultData.message);

        setScanResult(resultData);
        setError(null);
        toast.success('Order Verified!');
      } catch (err) {
        setError(err.message);
        setScanResult(null);
        toast.error(err.message);
      }
    };

    const handleScanError = (errorMessage) => {
      // This function is called for scanning errors (e.g., no QR found)
      // We can ignore these for a smoother experience
    };

    scanner.render(handleScanSuccess, handleScanError);

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner.", error);
      });
    };
  }, [isScanning, token]); // Rerun the effect if isScanning changes

  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true); // This will trigger the useEffect to restart the scanner
  };

  return (
    <div className="scanner-page">
      <h1>Scan Student's QR Code</h1>
      
      {/* The scanner will be rendered inside this div */}
      {isScanning && <div id="qr-reader" className="scanner-container"></div>}

      {scanResult && (
        <div className="result-container success">
          <h2>Order Verified!</h2>
          <p><strong>Order ID:</strong> {scanResult.order._id}</p>
          <p><strong>Total:</strong> ₹{scanResult.order.totalAmount}</p>
          <h3>Items to Deliver:</h3>
          <ul>
            {scanResult.order.items.map((item, index) => (
              <li key={index}>{item.name} (x{item.quantity})</li>
            ))}
          </ul>
          <button onClick={handleScanAgain} className="scan-again-btn">Scan Next</button>
        </div>
      )}

      {error && (
        <div className="result-container error">
          <h2>Scan Failed!</h2>
          <p>{error}</p>
          <button onClick={handleScanAgain} className="scan-again-btn">Try Again</button>
        </div>
      )}
    </div>
  );
}

export default StaffScannerPage;
