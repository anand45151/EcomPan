import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, CreditCard, RefreshCw } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { getOrder } from '../../services/firestoreService';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import './OrderDetailPage.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
  pending: { label: 'Order Placed', icon: '📋' },
  processing: { label: 'Processing', icon: '⚙️' },
  shipped: { label: 'Shipped', icon: '🚚' },
  delivered: { label: 'Delivered', icon: '✅' },
  cancelled: { label: 'Cancelled', icon: '❌' },
};

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((o) => {
        if (!o || o.userId !== user.uid) { navigate('/orders'); return; }
        setOrder(o);
      })
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="od-page">
        <AppNavbar />
        <div className="od-loading"><div className="spinner" /></div>
      </div>
    );
  }

  if (!order) return null;

  const currentIdx = STATUS_STEPS.indexOf(order.status);

  function handleReorder() {
    order.items.forEach((item) => {
      addItem(
        { id: item.productId, name: item.name, emoji: item.emoji, price: item.unitPrice, bulkPricing: [] },
        item.quantity
      );
    });
    toast.success('Items added to cart!');
    navigate('/cart');
  }

  return (
    <div className="od-page">
      <AppNavbar />
      <div className="od-container">
        <button className="od-back" onClick={() => navigate('/orders')}>
          <ArrowLeft size={15} /> Back to Orders
        </button>

        <div className="od-header">
          <div>
            <h1>Order #{order.orderNumber}</h1>
            <p className="od-date">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <button className="od-reorder" onClick={handleReorder}>
            <RefreshCw size={15} /> Reorder
          </button>
        </div>

        {/* Order tracker */}
        {order.status !== 'cancelled' && (
          <div className="od-tracker">
            {STATUS_STEPS.map((s, i) => {
              const meta = STATUS_META[s];
              const done = i <= currentIdx;
              return (
                <React.Fragment key={s}>
                  <div className={`od-step ${done ? 'done' : ''}`}>
                    <div className="od-step-icon">{done ? meta.icon : '○'}</div>
                    <span>{meta.label}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`od-step-line ${i < currentIdx ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="od-cancelled-banner">❌ This order has been cancelled.</div>
        )}

        <div className="od-grid">
          {/* Items */}
          <div className="od-card">
            <h3><Package size={16} /> Order Items</h3>
            {order.items.map((item) => (
              <div key={item.productId} className="od-item">
                <span className="od-item-emoji">{item.emoji || '🍃'}</span>
                <div className="od-item-info">
                  <strong>{item.name}</strong>
                  <span>₹{item.unitPrice} × {item.quantity}</span>
                </div>
                <span className="od-item-sub">₹{item.subtotal?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="od-totals">
              <div className="od-row"><span>Total</span><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <div className="od-sidebar">
            {/* Delivery */}
            <div className="od-card">
              <h3><MapPin size={16} /> Delivery Address</h3>
              {order.deliveryAddress ? (
                <div className="od-address">
                  {order.deliveryAddress.label && <strong>{order.deliveryAddress.label}</strong>}
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                </div>
              ) : <p className="od-na">No address on record.</p>}
            </div>

            {/* Payment */}
            <div className="od-card">
              <h3><CreditCard size={16} /> Payment</h3>
              <div className="od-payment-row">
                <span>Status</span>
                <span className={`od-pay-status ${order.paymentStatus}`}>
                  {order.paymentStatus === 'paid' ? '✅ Paid' : order.paymentStatus === 'failed' ? '❌ Failed' : '⏳ Pending'}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="od-payment-row">
                  <span>Payment ID</span>
                  <span className="od-pay-id">{order.razorpayPaymentId}</span>
                </div>
              )}
              <div className="od-payment-row">
                <span>Amount</span>
                <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
