import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Eye } from 'lucide-react';
import { subscribeToAllOrders, updateOrderStatus } from '../../services/firestoreService';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#3b82f6', bg: '#dbeafe' },
  shipped: { label: 'Shipped', color: '#8b5cf6', bg: '#ede9fe' },
  delivered: { label: 'Delivered', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (status === order.status) { onClose(); return; }
    setSaving(true);
    try {
      await updateOrderStatus(order.id, status);
      toast.success('Order status updated!');
      onStatusChange();
      onClose();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setSaving(false);
    }
  }

  const meta = STATUS_META[order.status] || STATUS_META.pending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order #{order.orderNumber}</h2>
            <p className="order-modal-date">{formatDate(order.createdAt)}</p>
          </div>
          <span className="admin-badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
        </div>

        <div className="order-modal-body">
          {/* Items */}
          <div className="om-section">
            <h4>Items</h4>
            {order.items?.map((item) => (
              <div key={item.productId} className="om-item">
                <span>{item.emoji || '🍃'}</span>
                <div>
                  <strong>{item.name}</strong>
                  <span>₹{item.unitPrice} × {item.quantity}</span>
                </div>
                <span className="om-sub">₹{item.subtotal?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="om-total">
              <span>Total</span>
              <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Address */}
          <div className="om-section">
            <h4>Delivery Address</h4>
            {order.deliveryAddress ? (
              <p className="om-addr">
                {order.deliveryAddress.label && <strong>{order.deliveryAddress.label}: </strong>}
                {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
            ) : <p className="om-na">No address.</p>}
          </div>

          {/* Payment */}
          <div className="om-section">
            <h4>Payment</h4>
            <div className="om-pay">
              <span>Status: <strong>{order.paymentStatus}</strong></span>
              {order.razorpayPaymentId && (
                <span>Payment ID: <code>{order.razorpayPaymentId}</code></span>
              )}
            </div>
          </div>

          {/* Update status */}
          <div className="om-section">
            <h4>Update Status</h4>
            <div className="om-status-row">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (filterStatus !== 'all') list = list.filter((o) => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.userId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filterStatus, search]);

  const counts = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    }, {});
  }, [orders]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-sub">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="ao-status-tabs">
        <button className={`ao-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
          All <span className="ao-tab-count">{orders.length}</span>
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`ao-tab ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {STATUS_META[s].label} <span className="ao-tab-count">{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ao-search">
        <Search size={15} />
        <input
          placeholder="Search by order number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading orders…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">No orders found.</td></tr>
              ) : filtered.map((o) => {
                const meta = STATUS_META[o.status] || STATUS_META.pending;
                return (
                  <tr key={o.id}>
                    <td className="ao-order-num">#{o.orderNumber}</td>
                    <td className="text-muted">{formatDate(o.createdAt)}</td>
                    <td className="text-muted">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={`ao-pay ${o.paymentStatus}`}>{o.paymentStatus}</span>
                    </td>
                    <td>
                      <span className="admin-badge" style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="ao-amount">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <button className="admin-btn admin-btn-outline" onClick={() => setSelected(o)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={() => { /* real-time listener handles refresh */ }}
        />
      )}
    </div>
  );
}
