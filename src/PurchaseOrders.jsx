import { useState, useEffect } from "react";
import { getPurchaseOrders, updatePurchaseOrderStatus } from "../api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";

export default function PurchaseOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Filters
  const [filterId, setFilterId] = useState("");
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
    new Date(new Date().setDate(new Date().getDate() + 30))
  ]);
  const [filterStatus, setFilterStatus] = useState("");
  
  // Data
  const [orders, setOrders] = useState([]);
  const [lastDocs, setLastDocs] = useState([]); // Stack of lastDocs for pagination
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [showCalendar, setShowCalendar] = useState(false);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "tongpub") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  // Refined useEffect for page change and search trigger
  useEffect(() => {
      if (!isAuthenticated) return;
      
      const load = async () => {
          setLoading(true);
          try {
            let lastDoc = null;
            if (page > 1) {
                lastDoc = lastDocs[page - 2];
            }
            
            const result = await getPurchaseOrders({
                id: filterId,
                dateFrom: dateRange ? dateRange[0].toISOString() : null,
                dateTo: dateRange ? dateRange[1].toISOString() : null,
                status: filterStatus,
                lastDoc: lastDoc,
                pageSize: 25
            });
            
            setOrders(result.orders);
            if (result.lastDoc) {
                // Update lastDocs at index page-1
                const newLastDocs = [...lastDocs];
                newLastDocs[page - 1] = result.lastDoc;
                setLastDocs(newLastDocs);
            }
            setHasMore(result.orders.length === 25);
            setTotalCount(result.totalCount);
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      
      load();
      
  }, [page, isAuthenticated, searchTrigger]); 
  
  const handleSearch = () => {
      setPage(1);
      setLastDocs([]);
      setSearchTrigger(prev => prev + 1);
  };

  const handleNextPage = () => {
    setPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
        setPage(p => p - 1);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus || newStatus === selectedOrder.status) return;
    
    setUpdating(true);
    try {
        await updatePurchaseOrderStatus(selectedOrder.id, newStatus, selectedOrder.status);
        
        // Update local state
        const updatedOrder = { ...selectedOrder, status: newStatus };
        setSelectedOrder(updatedOrder);
        
        // Update in list
        setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
        
        alert("Status updated successfully");
    } catch (error) {
        console.error("Failed to update status", error);
        alert("Failed to update status");
    } finally {
        setUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h2>Admin Access</h2>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
            />
          </div>
          <button type="submit" className="rent-btn">Login</button>
        </form>
      </div>
    );
  }

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'WAITING_FOR_DELIVERY': return 'status-badge status-waiting';
      case 'DELIVERED': return 'status-badge status-delivered';
      case 'ITEM_RETURNED': return 'status-badge status-returned';
      case 'CANCELLED': return 'status-badge status-cancelled';
      default: return 'status-badge';
    }
  };

  return (
    <div className="purchase-orders-page">
      <h1>Purchase Orders</h1>
      
      <div className="filters-container">
        <div className="filter-group">
            <label>Order ID</label>
            <input 
                type="text" 
                value={filterId} 
                onChange={(e) => setFilterId(e.target.value)} 
                placeholder="Search ID"
                className="filter-input"
            />
        </div>
        
        <div className="filter-group">
            <label>Rental Period (From - To)</label>
            <div 
                onClick={() => setShowCalendar(!showCalendar)}
                className="date-range-display"
            >
                {dateRange && dateRange[0] && dateRange[1] 
                    ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}` 
                    : "Select Date Range"}
            </div>
            {showCalendar && (
                <div className="calendar-popup">
                    <Calendar 
                        selectRange={true} 
                        onChange={(val) => {
                            setDateRange(val);
                            if (val[0] && val[1]) setShowCalendar(false);
                        }} 
                        value={dateRange}
                        className="rental-calendar"
                    />
                </div>
            )}
        </div>
        
        <div className="filter-group">
            <label>Status</label>
            <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
            >
                <option value="">All Status</option>
                <option value="WAITING_FOR_DELIVERY">WAITING_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="ITEM_RETURNED">ITEM_RETURNED</option>
                <option value="CANCELLED">CANCELLED</option>
            </select>
        </div>

        <button onClick={handleSearch} className="search-btn" title="Search">
            <FaSearch />
        </button>
      </div>

      {loading ? (
          <div className="loading-state">
            <p>Loading orders...</p>
          </div>
      ) : (
          <div className="orders-table-container">
            <div className="orders-found-count">
                Found {totalCount} orders
            </div>
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Status</th>
                        <th>WhatsApp</th>
                        <th>Address</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.id}>
                            <td>{(page - 1) * 25 + index + 1}</td>
                            <td title={order.id}>
                                <code className="order-id-code">
                                  {order.id.substring(0, 6)}...
                                </code>
                            </td>
                            <td>
                                <span className={getStatusBadgeClass(order.status)}>
                                    {order.status}
                                </span>
                            </td>
                            <td>{order.whatsappNumber}</td>
                            <td>{order.deliveryAddress}</td>
                            <td>{formatDate(order.rentalPeriodFrom)}</td>
                            <td>{formatDate(order.rentalPeriodTo)}</td>
                            <td>
                                <button 
                                    className="view-btn"
                                    onClick={() => handleViewOrder(order)}
                                    title="View Details"
                                >
                                    <FaEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan="7" className="no-orders-message">
                              No orders found matching your criteria
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      )}
      
      <div className="pagination-controls">
        <button 
            onClick={handlePrevPage} 
            disabled={page === 1 || loading}
            className="pagination-btn"
        >
            Previous
        </button>
        <span className="page-indicator">Page {page}</span>
        <button 
            onClick={handleNextPage} 
            disabled={!hasMore || loading}
            className="pagination-btn"
        >
            Next
        </button>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>Order Details</h2>
                    <button className="close-modal-btn" onClick={handleCloseModal}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="order-detail-section">
                    <h3>Customer Information</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Full Name</label>
                            <div>{selectedOrder.fullName}</div>
                        </div>
                        <div className="detail-item">
                            <label>Email</label>
                            <div>{selectedOrder.email}</div>
                        </div>
                        <div className="detail-item">
                            <label>WhatsApp</label>
                            <div>{selectedOrder.whatsappNumber}</div>
                        </div>
                        <div className="detail-item">
                            <label>Order ID</label>
                            <div>{selectedOrder.id}</div>
                        </div>
                    </div>
                </div>

                <div className="order-detail-section">
                    <h3>Delivery Information</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Address</label>
                            <div>{selectedOrder.deliveryAddress}</div>
                        </div>
                        <div className="detail-item">
                            <label>Hotel/Accommodation</label>
                            <div>{selectedOrder.hotelOrAccommodationName}</div>
                        </div>
                        <div className="detail-item">
                            <label>Room Number</label>
                            <div>{selectedOrder.roomNumber || "-"}</div>
                        </div>
                    </div>
                </div>

                <div className="order-detail-section">
                    <h3>Rental Period</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>From</label>
                            <div>{formatDate(selectedOrder.rentalPeriodFrom)}</div>
                        </div>
                        <div className="detail-item">
                            <label>To</label>
                            <div>{formatDate(selectedOrder.rentalPeriodTo)}</div>
                        </div>
                    </div>
                </div>

                <div className="order-detail-section">
                    <h3>Items</h3>
                    <table className="order-items-list">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>ID</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedOrder.rentItems && selectedOrder.rentItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        {item.imageUrl && (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        )}
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.id || item.monitorId}</td>
                                    <td>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="order-detail-section">
                    <h3>Payment</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Total Fee</label>
                            <div>{selectedOrder.totalFee} THB</div>
                        </div>
                        <div className="detail-item">
                            <label>Created At</label>
                            <div>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="status-update-section">
                    <div className="filter-group" style={{ flex: 1 }}>
                        <label>Update Status</label>
                        <select 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="filter-select"
                            style={{ width: '100%' }}
                        >
                            <option value="WAITING_FOR_DELIVERY">WAITING_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="ITEM_RETURNED">ITEM_RETURNED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleUpdateStatus} 
                        className="update-status-btn"
                        disabled={updating || newStatus === selectedOrder.status}
                        style={{ opacity: (updating || newStatus === selectedOrder.status) ? 0.5 : 1 }}
                    >
                        {updating ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}