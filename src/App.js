import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import MenuItem from './components/MenuItem';
import Cart from './components/Cart';
import CategoryFilter from './components/CategoryFilter';
import SearchBar from './components/SearchBar';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffScannerPage from './pages/StaffScannerPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

// Main App component sets up the router for all pages
function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="bottom-center" />
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* Protected Manager Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Staff Route */}
          <Route 
            path="/staff/scanner" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'manager']}>
                <StaffScannerPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

// HomePage component contains all the logic for the student menu
function HomePage() {
  const navigate = useNavigate();
  
  // --- Check User Role on Load ---
  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {}
    
    if (user && user.role === 'staff') {
      navigate('/staff/scanner');
    }
  }, [navigate]);

  // --- State Variables ---
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Core Functions ---

  // MODIFIED: addToCart now checks against available stock
  const addToCart = (itemToAdd) => {
    const stockItem = menuItems.find(item => item._id === itemToAdd._id);
    const itemInCart = cartItems.find(item => item._id === itemToAdd._id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (stockItem.quantity <= 0) {
      toast.error(`${itemToAdd.name} is sold out!`);
      return;
    }

    if (currentQuantityInCart >= stockItem.quantity) {
      toast.error(`No more ${itemToAdd.name} in stock!`);
      return;
    }

    toast.success(`${itemToAdd.name} added to cart!`);
    setCartItems(prevItems => {
      const isItemInCart = prevItems.find(item => item._id === itemToAdd._id);
      if (isItemInCart) {
        return prevItems.map(item =>
          item._id === itemToAdd._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  const decreaseQuantity = (itemToDecrease) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === itemToDecrease._id);
      if (existingItem.quantity === 1) {
        return prevItems.filter(item => item._id !== itemToDecrease._id);
      } else {
        return prevItems.map(item =>
          item._id === itemToDecrease._id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    const orderDetails = {
      items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
      totalAmount: cartItems.reduce((price, item) => price + item.quantity * item.price, 0),
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success('Order placed!');
      navigate('/order-success', { state: { orderDetails: { ...orderDetails, orderId: data.orderId } } });
      setCartItems([]);
    } catch (error) {
      toast.error(error.message);
      console.error('Failed to create order:', error);
    }
  };
  
  // --- Data Fetching ---
  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/menu`)
      .then(response => response.json())
      .then(data => {
        setMenuItems(data);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
        console.error("Error fetching menu:", error);
      });
  }, []);

  // --- Filtering Logic ---
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = menuItems
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="main-layout">
      <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <main className="menu-section">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="menu-container">
          {isLoading ? <p>Loading menu...</p> :
            (filteredMenuItems.length > 0 ?
              filteredMenuItems.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MenuItem item={item} addToCart={addToCart} />
                </motion.div>
              ))
              : 
              <div className="not-found-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-emoji-dizzy" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M9.146 5.146a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 1 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 0-.708zm-5 0a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 1 1 .708.708l-.647.646.647.646a.5.5 0 1 1-.708.708L5.5 7.207l-.646.647a.5.5 0 1 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 0-.708zM10 11a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 0 1h-.5v.5a.5.5 0 0 1-1 0v-.5h-.5a.5.5 0 0 1 0-1h.5v-.5a.5.5 0 0 1 .5-.5z"/></svg>
                <h3>Oops! Nothing found.</h3>
                <p>Are you craving something from another dimension?</p>
              </div>
            )
          }
        </div>
      </main>
      <Cart cartItems={cartItems} handleCheckout={handleCheckout} addToCart={addToCart} decreaseQuantity={decreaseQuantity} />
    </div>
  );
}

export default App;
