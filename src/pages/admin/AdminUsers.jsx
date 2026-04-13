import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Building, Mail, Phone } from 'lucide-react';
import { getAllUsers } from '../../services/firestoreService';
import './AdminUsers.css';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) ||
             u.email?.toLowerCase().includes(q) ||
             u.businessName?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Business Clients</h1>
          <p className="admin-page-sub">{users.length} registered accounts</p>
        </div>
      </div>

      <div className="au-search">
        <Search size={15} />
        <input
          placeholder="Search by name, email, or business…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading clients…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Business</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Addresses</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No users found.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="au-user-cell">
                      {u.photoURL
                        ? <img src={u.photoURL} alt={u.name} referrerPolicy="no-referrer" className="au-avatar" />
                        : <div className="au-avatar-placeholder">{u.name?.[0] || '?'}</div>
                      }
                      <div>
                        <strong>{u.name}</strong>
                        <span className="au-email"><Mail size={10} /> {u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.businessName
                      ? <span className="au-business"><Building size={13} /> {u.businessName}</span>
                      : <span className="au-na">—</span>}
                  </td>
                  <td>
                    {u.phone
                      ? <span className="au-phone"><Phone size={12} /> {u.phone}</span>
                      : <span className="au-na">—</span>}
                  </td>
                  <td>
                    <span className={`admin-badge ${u.role === 'admin' ? 'au-admin' : 'au-customer'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(u.createdAt)}</td>
                  <td className="text-muted">{u.addresses?.length || 0} saved</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
