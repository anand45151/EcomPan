import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, RefreshCw } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserOrders } from '../../services/firestoreService';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import './OrdersPage.css';

const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#3b82f6', bg: '#dbeafe' },
  shipped: { label: 'Shipped', color: '#8b5cf6', bg: '#ede9fe' },
  delivered: { label: 'Delivered', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="order-status-badge" style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToUserOrders(user.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  function handleReorder(order) {
    order.items.forEach((item) => {
      addItem(
        { id: item.productId, name: item.name, emoji: item.emoji, price: item.unitPrice, bulkPricing: [] },
        item.quantity
      );
    });
    toast.success('Items added to cart for reorder!');
  }

  return (
    <div className="orders-page">
      <AppNavbar />
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="orders-loading">
            {[...Array(3)].map((_, i) => <div key={i} className="order-skeleton" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <Package size={56} strokeWidth={1} />
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you place them.</p>
            <Link to="/products" className="orders-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.productId} className="order-item-preview">
                      <span>{item.emoji || '🍃'}</span>
                      <span>{item.name}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="order-more">+{order.items.length - 3} more</span>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="order-actions">
                    <button
                      className="reorder-btn"
                      onClick={() => handleReorder(order)}
                      title="Add items to cart for reorder"
                    >
                      <RefreshCw size={14} /> Reorder
                    </button>
                    <Link to={`/orders/${order.id}`} className="view-order-btn">
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
