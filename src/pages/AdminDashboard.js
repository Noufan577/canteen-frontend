import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';

// --- API Helper Functions ---
// This centralizes all API calls and ensures they use the correct live URL and token.
const api = {
  get: async (url, token) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },
  post: async (url, body, token) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message);
    }
    return response.json();
  },
  put: async (url, body, token) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message);
    }
    return response.json();
  },
  patch: async (url, body, token) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message);
    }
    return response.json();
  },
  delete: async (url, token) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message);
    }
    return response.json();
  }
};


function AdminDashboard() {
  // State for UI
  const [activeTab, setActiveTab] = useState('menu');
  const [modal, setModal] = useState(null); // null, 'menu', 'staff', 'password'

  // State for data
  const [menuItems, setMenuItems] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  
  // State for forms
  const [currentItem, setCurrentItem] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const token = localStorage.getItem('token');

  // --- Data Fetching ---
  const fetchMenu = useCallback(async () => {
    try {
      // The menu is public, so we don't strictly need a token, but sending it is fine.
      const data = await api.get('/api/menu', token);
      setMenuItems(data);
    } catch (error) {
      toast.error(`Failed to fetch menu: ${error.message}`);
    }
  }, [token]);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/users', token);
      setStaffMembers(data);
    } catch (error) {
      toast.error(`Failed to fetch staff: ${error.message}`);
    }
  }, [token]);

  useEffect(() => {
    fetchMenu();
    fetchStaff();
  }, [fetchMenu, fetchStaff]);

  // --- Form Handlers ---
  const handleInputChange = (e, setState) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- Menu Management ---
  const handleAddNewMenu = () => {
    setCurrentItem({ name: '', price: '', category: 'Snacks', imageUrl: '', quantity: 0 });
    setModal('menu');
  };
  const handleEditMenu = (item) => {
    setCurrentItem(item);
    setModal('menu');
  };
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!currentItem._id;
    const url = isEditing ? `/api/menu/${currentItem._id}` : '/api/menu';
    const method = isEditing ? api.put : api.post;
    try {
      await method(url, currentItem, token);
      toast.success(`Item ${isEditing ? 'updated' : 'created'}!`);
      setModal(null);
      fetchMenu();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDeleteMenu = async (itemId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/menu/${itemId}`, token);
      toast.success('Item deleted!');
      fetchMenu();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // --- Staff Management ---
  const handleAddNewStaff = () => {
    setCurrentStaff({ email: '', password: '' });
    setModal('staff');
  };
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      // Note: The register endpoint doesn't need a token in our current setup
      await api.post('/api/auth/register', { ...currentStaff, role: 'staff' }, null);
      toast.success('Staff member added!');
      setModal(null);
      fetchStaff();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleDismissStaff = async (staffId) => {
    if (!window.confirm("Are you sure? This is permanent.")) return;
    try {
      await api.delete(`/api/admin/users/${staffId}`, token);
      toast.success('Staff member dismissed.');
      fetchStaff();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handlePasswordResetClick = (staff) => {
    setCurrentStaff(staff);
    setNewPassword('');
    setModal('password');
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    try {
      await api.patch(`/api/admin/users/${currentStaff._id}/password`, { password: newPassword }, token);
      toast.success("Password reset successfully!");
      setModal(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // --- Report Download ---
  const handleDownloadReport = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports/daily`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to generate report.');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `daily_report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Report downloaded!');
    } catch (error) {
        toast.error(error.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-tabs">
        <button onClick={() => setActiveTab('menu')} className={activeTab === 'menu' ? 'active' : ''}>Menu Management</button>
        <button onClick={() => setActiveTab('staff')} className={activeTab === 'staff' ? 'active' : ''}>Staff Management</button>
      </div>

      {activeTab === 'menu' && (
        <div>
          <div className="dashboard-header">
            <h1>Menu Items</h1>
            <div>
              <button onClick={handleDownloadReport} className="report-btn">Download Report</button>
              <button onClick={handleAddNewMenu} className="add-new-btn">Add New Item</button>
            </div>
          </div>
          <div className="menu-item-list">
            {menuItems.map(item => (
              <div key={item._id} className="admin-menu-item">
                <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Category: {item.category}</p>
                  <p>Price: ₹{item.price}</p>
                  <p><strong>In Stock: {item.quantity}</strong></p>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEditMenu(item)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteMenu(item._id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div>
          <div className="dashboard-header">
            <h1>Staff Members</h1>
            <button onClick={handleAddNewStaff} className="add-new-btn">Add New Staff</button>
          </div>
          <div className="staff-list">
            {staffMembers.map(staff => (
              <div key={staff._id} className="admin-menu-item">
                <div className="item-info"><h4>{staff.email}</h4><p>Role: {staff.role}</p></div>
                <div className="item-actions">
                  <button onClick={() => handlePasswordResetClick(staff)} className="edit-btn">Reset Password</button>
                  <button onClick={() => handleDismissStaff(staff._id)} className="delete-btn">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      {modal === 'menu' && (
        <div className="form-modal">
          <form onSubmit={handleMenuSubmit} className="menu-item-form">
            <h2>{currentItem?._id ? 'Edit Item' : 'Add New Item'}</h2>
            <input name="name" value={currentItem?.name || ''} onChange={(e) => handleInputChange(e, setCurrentItem)} placeholder="Item Name" required />
            <input name="price" type="number" value={currentItem?.price || ''} onChange={(e) => handleInputChange(e, setCurrentItem)} placeholder="Price" required />
            <input name="quantity" type="number" value={currentItem?.quantity || 0} onChange={(e) => handleInputChange(e, setCurrentItem)} placeholder="Available Quantity" required />
            <input name="imageUrl" value={currentItem?.imageUrl || ''} onChange={(e) => handleInputChange(e, setCurrentItem)} placeholder="Image URL" />
            <select name="category" value={currentItem?.category || 'Snacks'} onChange={(e) => handleInputChange(e, setCurrentItem)}>
              <option value="Snacks">Snacks</option><option value="Meals">Meals</option><option value="Drinks">Drinks</option>
            </select>
            <div className="form-actions">
              <button type="submit">{currentItem?._id ? 'Update Item' : 'Create Item'}</button>
              <button type="button" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'staff' && (
        <div className="form-modal">
          <form onSubmit={handleAddStaffSubmit} className="menu-item-form">
            <h2>Add New Staff</h2>
            <input name="email" type="email" value={currentStaff?.email || ''} onChange={(e) => handleInputChange(e, setCurrentStaff)} placeholder="Staff Email" required />
            <input name="password" type="password" value={currentStaff?.password || ''} onChange={(e) => handleInputChange(e, setCurrentStaff)} placeholder="Temporary Password" required />
            <div className="form-actions">
              <button type="submit">Create Account</button>
              <button type="button" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'password' && (
        <div className="form-modal">
          <form onSubmit={handlePasswordSubmit} className="menu-item-form">
            <h2>Reset Password</h2>
            <p>For: <strong>{currentStaff?.email}</strong></p>
            <input name="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter New Password" required />
            <div className="form-actions">
              <button type="submit">Update Password</button>
              <button type="button" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
