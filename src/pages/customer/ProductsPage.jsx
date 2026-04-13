import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Star, Filter, X } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useCartStore } from '../../store/cartStore';
import { getProducts } from '../../services/firestoreService';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import toast from 'react-hot-toast';
import './ProductsPage.css';

function BulkBadge({ bulkPricing }) {
  if (!bulkPricing?.length) return null;
  const cheapest = [...bulkPricing].sort((a, b) => b.minQty - a.minQty)[0];
  return (
    <span className="bulk-badge">
      Bulk from ₹{cheapest.price}
    </span>
  );
}

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  function handleAdd() {
    addItem(product, qty);
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image">
        {product.image
          ? <img src={product.image} alt={product.name} />
          : <div className="product-card-emoji">{product.emoji || '🍃'}</div>
        }
        {!product.isAvailable && <div className="product-card-unavailable">Out of Stock</div>}
        <div className="product-card-tags">
          {product.tags?.slice(0, 2).map((t) => (
            <span key={t} className="product-card-tag">{t}</span>
          ))}
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="product-card-category">
            {CATEGORIES.find((c) => c.id === product.category)?.name}
          </span>
          <span className="product-card-rating">
            <Star size={11} fill="currentColor" /> {product.rating || 4.8}
          </span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.description?.substring(0, 72)}…</p>

        <div className="product-card-pricing">
          <span className="product-card-price">₹{product.price}</span>
          <span className="product-card-unit">/ piece</span>
          <BulkBadge bulkPricing={product.bulkPricing} />
        </div>

        <div className="product-card-actions">
          <div className="qty-selector">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <button
            className="add-cart-btn"
            onClick={handleAdd}
            disabled={!product.isAvailable}
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    getProducts({ isAvailable: undefined })
      .then((data) => { if (data.length) setProducts(data); })
      .catch(() => { /* use seed data */ })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') list = list.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.includes(q))
      );
    }
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, activeCategory, search, sortBy]);

  return (
    <div className="products-page">
      <AppNavbar />

      <div className="products-hero">
        <div className="products-hero-inner">
          <span className="section-label">Wholesale Catalogue</span>
          <h1>Our Paan Collection</h1>
          <p>Premium betel leaf creations at bulk pricing. Minimum orders may apply.</p>
        </div>
      </div>

      <div className="products-controls">
        <div className="products-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products, ingredients, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
        </div>

        <div className="products-filters">
          <div className="category-tabs">
            {[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                className={`cat-tab ${activeCategory === c.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="products-container">
        {loading ? (
          <div className="products-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">
            <span>🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }}>Clear filters</button>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
