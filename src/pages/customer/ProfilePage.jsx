import React, { useState } from 'react';
import { User, MapPin, Building, Phone, Mail, Save, Plus, Trash2 } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, addAddress } from '../../services/firestoreService';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
    gstin: user?.gstin || '',
  });
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', state: '', pincode: '' });
  const [addingAddr, setAddingAddr] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill required fields.');
      return;
    }
    try {
      const saved = await addAddress(user.uid, newAddr);
      setAddresses((a) => [...a, saved]);
      setNewAddr({ label: '', street: '', city: '', state: '', pincode: '' });
      setAddingAddr(false);
      toast.success('Address saved!');
    } catch (err) {
      toast.error('Failed to save address.');
    }
  }

  return (
    <div className="profile-page">
      <AppNavbar />
      <div className="profile-container">
        <div className="profile-header">
          {user?.photoURL
            ? <img src={user.photoURL} alt={user.name} className="profile-avatar" referrerPolicy="no-referrer" />
            : <div className="profile-avatar-placeholder"><User size={32} /></div>
          }
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            {user?.businessName && <span className="profile-business">{user.businessName}</span>}
          </div>
        </div>

        <div className="profile-tabs">
          {['profile', 'addresses'].map((t) => (
            <button
              key={t}
              className={`profile-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'profile' ? <><User size={15} /> Profile</> : <><MapPin size={15} /> Addresses</>}
            </button>
          ))}
        </div>

        <div className="profile-body">
          {tab === 'profile' && (
            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="profile-form-section">
                <h3>Personal Information</h3>
                <div className="pf-field">
                  <label><User size={14} /> Full Name</label>
                  <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="pf-field">
                  <label><Mail size={14} /> Email</label>
                  <input value={user?.email} disabled className="pf-disabled" />
                </div>
                <div className="pf-field">
                  <label><Phone size={14} /> Phone</label>
                  <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="profile-form-section">
                <h3>Business Details</h3>
                <div className="pf-field">
                  <label><Building size={14} /> Business Name</label>
                  <input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} placeholder="Your restaurant / business name" />
                </div>
                <div className="pf-field">
                  <label>GSTIN (optional)</label>
                  <input value={profile.gstin} onChange={(e) => setProfile({ ...profile, gstin: e.target.value })} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </div>
              </div>

              <button type="submit" className="pf-save-btn" disabled={saving}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {tab === 'addresses' && (
            <div className="addresses-tab">
              <div className="addresses-list">
                {addresses.length === 0 && !addingAddr && (
                  <p className="no-addresses">No addresses saved yet.</p>
                )}
                {addresses.map((addr) => (
                  <div key={addr.id} className="addr-item">
                    <div className="addr-item-icon"><MapPin size={16} /></div>
                    <div className="addr-item-body">
                      <strong>{addr.label || 'Address'}</strong>
                      <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!addingAddr && (
                <button className="add-addr-trigger" onClick={() => setAddingAddr(true)}>
                  <Plus size={16} /> Add New Address
                </button>
              )}

              {addingAddr && (
                <form className="addr-form-profile" onSubmit={handleAddAddress}>
                  <h4>New Address</h4>
                  <div className="form-row">
                    <input name="label" placeholder="Label (e.g. Main Outlet)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <input name="street" placeholder="Street address *" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required />
                  </div>
                  <div className="form-row-2">
                    <input name="city" placeholder="City *" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required />
                    <input name="state" placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <input name="pincode" placeholder="Pincode *" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} required maxLength={6} />
                  </div>
                  <div className="form-btns">
                    <button type="submit" className="btn-primary">Save Address</button>
                    <button type="button" className="btn-ghost" onClick={() => setAddingAddr(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
