import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

/**
 * ScannerContent Component
 * Fixed to ensure it hits the correct /api/orders/scan endpoint and handles 401s.
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
    
    // Redirect if not logged in
    if (!token || !userStr) {
      toast.error("Security session missing. Please login.");
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }

    // Role check
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'staff' && user.role !== 'manager') {
        toast.error("Unauthorized: Staff only.");
        navigate('/');
        return;
      }
    } catch (e) {
      navigate('/login');
    }

    // Load scanner library
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
      // Ensure we hit the LIVE render URL if available, otherwise localhost
      const apiUrl = process.env.REACT_APP_API_URL || 'https://canteen-api-eassyfood.onrender.com';

      console.log(`[DEBUG] Scanning Order at: ${apiUrl}/api/orders/scan`);

      // FIXED: Endpoint corrected from /api/menu to /api/orders/scan
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
        // If the token is rejected, force a logout to refresh the session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error("Session expired or invalid token. Redirecting to login...");
      }

      if (response.ok) {
        toast.success(data.message || 'Order Redeemed!', {
          duration: 5000,
          style: { background: '#10b981', color: '#fff' }
        });
      } else {
        toast.error(data.message || 'Verification Failed');
      }
    } catch (error) {
      console.error("[Scanner Error]", error);
      toast.error(error.message);
      if (error.message.includes("Redirecting")) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsProcessing(false);
      // Wait 3 seconds before allowing the next scan
      setTimeout(() => {
        setScanResult(null);
      }, 3000);
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
                <p className="text-slate-500 text-xs mt-4">Waking up camera...</p>
              </div>
            )}
            
            <div id="reader"></div>

            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-900 mt-4">Verifying...</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Status Report</h3>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              If you get a <strong>401 Error</strong> even after this fix, please 
              <strong> LOG OUT and LOG IN </strong> again. Your token might be from a previous session 
              that is no longer valid on the server.
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