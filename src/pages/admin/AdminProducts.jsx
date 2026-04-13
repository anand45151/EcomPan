import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import {
  getProducts, createProduct, updateProduct, deleteProduct, toggleProductAvailability
} from '../../services/firestoreService';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import toast from 'react-hot-toast';
import './AdminProducts.css';

const EMPTY_FORM = {
  name: '', category: 'sada', subCategory: '', description: '',
  ingredients: '', healthBenefits: '', price: '', emoji: '🍃',
  bulkPricing: '', tags: '', isAvailable: true,
};

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product
    ? {
        ...product,
        ingredients: product.ingredients?.join(', ') || '',
        healthBenefits: product.healthBenefits?.join(', ') || '',
        tags: product.tags?.join(', ') || '',
        bulkPricing: product.bulkPricing?.map((t) => `${t.minQty}:${t.price}`).join(', ') || '',
      }
    : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required.'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        healthBenefits: form.healthBenefits.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        bulkPricing: form.bulkPricing
          ? form.bulkPricing.split(',').map((t) => {
              const [minQty, price] = t.split(':');
              return { minQty: Number(minQty), price: Number(price) };
            }).filter((t) => t.minQty && t.price)
          : [],
      };
      if (product?.id) {
        await updateProduct(product.id, data);
        toast.success('Product updated!');
      } else {
        await createProduct(data);
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      toast.error('Failed to save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="mf-field">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="mf-field">
              <label>Emoji</label>
              <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)} maxLength={4} />
            </div>
            <div className="mf-field">
              <label>Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mf-field">
              <label>Sub-Category</label>
              <input value={form.subCategory} onChange={(e) => set('subCategory', e.target.value)} placeholder="e.g. Rajwadi" />
            </div>
            <div className="mf-field mf-full">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="mf-field">
              <label>Price (₹) *</label>
              <input type="number" min="1" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div className="mf-field">
              <label>
                Bulk Pricing
                <span className="mf-hint">format: 50:13, 200:11</span>
              </label>
              <input value={form.bulkPricing} onChange={(e) => set('bulkPricing', e.target.value)} placeholder="50:13, 200:11" />
            </div>
            <div className="mf-field mf-full">
              <label>Ingredients <span className="mf-hint">comma-separated</span></label>
              <input value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} placeholder="Betel Leaf, Gulkand, Rose Petals" />
            </div>
            <div className="mf-field mf-full">
              <label>Health Benefits <span className="mf-hint">comma-separated</span></label>
              <input value={form.healthBenefits} onChange={(e) => set('healthBenefits', e.target.value)} placeholder="Aids digestion, Freshens breath" />
            </div>
            <div className="mf-field mf-full">
              <label>Tags <span className="mf-hint">comma-separated</span></label>
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="classic, digestive, traditional" />
            </div>
            <div className="mf-field">
              <label>Availability</label>
              <label className="toggle-label">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} />
                <span>{form.isAvailable ? 'Available' : 'Unavailable'}</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new
  const [filter, setFilter] = useState('all');

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts({});
      if (data.length) setProducts(data);
    } catch (_) { /* use seed */ }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted.');
      loadProducts();
    } catch {
      toast.error('Failed to delete product.');
    }
  }

  async function handleToggle(p) {
    try {
      await toggleProductAvailability(p.id, p.isAvailable);
      toast.success(`${p.name} marked ${p.isAvailable ? 'unavailable' : 'available'}.`);
      loadProducts();
    } catch {
      toast.error('Failed to update availability.');
    }
  }

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">{products.length} products in catalogue</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setModalProduct(null)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter tabs */}
      <div className="ap-filter-tabs">
        {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            className={`ap-tab ${filter === c.id ? 'active' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="ap-loading">
            {[...Array(5)].map((_, i) => <div key={i} className="ap-row-skeleton" />)}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Bulk Pricing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No products in this category.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="ap-product-cell">
                      <span className="ap-emoji">{p.emoji || '🍃'}</span>
                      <div>
                        <strong>{p.name}</strong>
                        {p.subCategory && <span className="ap-sub">{p.subCategory}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}
                  </td>
                  <td className="ap-price">₹{p.price}</td>
                  <td className="ap-bulk">
                    {p.bulkPricing?.length
                      ? p.bulkPricing.map((t) => `${t.minQty}+: ₹${t.price}`).join(', ')
                      : '—'}
                  </td>
                  <td>
                    <button
                      className={`ap-toggle ${p.isAvailable ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggle(p)}
                      title="Toggle availability"
                    >
                      {p.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {p.isAvailable ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td>
                    <div className="ap-actions">
                      <button className="admin-btn admin-btn-outline" onClick={() => setModalProduct(p)}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSave={() => { setModalProduct(undefined); loadProducts(); }}
        />
      )}
    </div>
  );
}
