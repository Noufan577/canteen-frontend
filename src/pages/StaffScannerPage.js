import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

/**
 * ScannerContent Component
 * Fixed the endpoint from /api/menu (Manager only) to /api/orders/scan (Staff/Manager).
 */
const ScannerContent = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Safety check for login session
    if (!token || !userStr) {
      toast.error("Session missing. Please login.");
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }

    // Role validation
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'staff' && user.role !== 'manager') {
        toast.error("Unauthorized access.");
        navigate('/');
        return;
      }
    } catch (e) {
      navigate('/login');
    }

    // Dynamic loading of the QR library
    const script = document.createElement('script');
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    script.onload = () => setIsLibraryLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!isLibraryLoaded || !document.getElementById('reader')) return;

    if (window.Html5QrcodeScanner) {
      const scanner = new window.Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scannerRef.current = scanner;
      scanner.render(onScanSuccess, (err) => {});
    }

    function onScanSuccess(result) {
      if (isProcessing) return;
      handleScan(result);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isLibraryLoaded, isProcessing]);

  const handleScan = async (orderId) => {
    setIsProcessing(true);
    setScanResult(orderId);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://canteen-api-eassyfood.onrender.com';

      // API call to the CORRECT scanning endpoint
      const response = await fetch(`${apiUrl}/api/orders/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error("Session expired. Please log in again.");
      }

      if (response.ok) {
        toast.success(data.message || 'Order Verified!', {
          duration: 5000,
          style: { background: '#10b981', color: '#fff' }
        });
      } else {
        toast.error(data.message || 'Verification Failed');
      }
    } catch (error) {
      console.error("[Scanner Error]", error);
      toast.error(error.message);
      if (error.message.includes("log in")) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mt-10">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Staff Scanner</h1>
          <p className="text-indigo-100 text-sm mt-1">Ready to verify student orders</p>
        </div>

        <div className="p-6">
          <div className="relative rounded-xl border-2 border-slate-100 overflow-hidden">
            {!isLibraryLoaded && (
              <div className="flex flex-col justify-center items-center h-64 animate-pulse">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs mt-4">Initializing camera...</p>
              </div>
            )}
            
            <div id="reader"></div>

            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-900 mt-4">Verifying Order...</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Status</h3>
            <p className="text-[10px] text-blue-700 leading-relaxed">
              Scan successful. If you encounter a 401 error, ensure you are logged in as a 
              <strong> Staff</strong> member and not just a standard user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScannerContent />
    </Router>
  );
};

export default App;