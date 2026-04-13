import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import { getAnalyticsSummary, getAllOrders } from '../../services/firestoreService';
import './AdminDashboard.css';

const STATUS_META = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#3b82f6', bg: '#dbeafe' },
  shipped: { label: 'Shipped', color: '#8b5cf6', bg: '#ede9fe' },
  delivered: { label: 'Delivered', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
};

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '20', color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAllOrders()])
      .then(([s, orders]) => {
        setStats(s);
        setRecentOrders(orders.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <div><h1 className="admin-page-title">Dashboard</h1></div>
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`}
          sub={`${stats?.paidOrders || 0} paid orders`}
          color="#16a34a"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          sub="All time"
          color="#3b82f6"
        />
        <StatCard
          icon={Users}
          label="Registered Clients"
          value={stats?.totalUsers || 0}
          sub="Business accounts"
          color="#8b5cf6"
        />
        <StatCard
          icon={Package}
          label="Active Products"
          value={stats?.totalProducts || 0}
          sub="In catalogue"
          color="#f59e0b"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-card dashboard-card">
          <div className="dashboard-card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all-link">View all <ArrowRight size={13} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="table-empty">No orders yet.</td></tr>
              ) : recentOrders.map((o) => {
                const meta = STATUS_META[o.status] || STATUS_META.pending;
                return (
                  <tr key={o.id}>
                    <td className="order-num-cell">#{o.orderNumber}</td>
                    <td className="text-muted">{formatDate(o.createdAt)}</td>
                    <td>
                      <span className="admin-badge" style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="font-semibold">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="admin-card dashboard-card">
          <div className="dashboard-card-header">
            <h3>Top Products</h3>
            <Link to="/admin/products" className="view-all-link">Manage <ArrowRight size={13} /></Link>
          </div>
          {stats?.topProducts?.length ? (
            <div className="top-products-list">
              {stats.topProducts.map((p, i) => (
                <div key={p.id} className="top-product-row">
                  <span className="tp-rank">#{i + 1}</span>
                  <div className="tp-info">
                    <strong>{p.name}</strong>
                    <span>{p.qty} units sold</span>
                  </div>
                  <span className="tp-revenue">₹{p.revenue?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="table-empty">No sales data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
