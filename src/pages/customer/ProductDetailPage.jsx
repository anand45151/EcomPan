import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Check, ChevronDown, ChevronUp } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useCartStore } from '../../store/cartStore';
import { getProduct } from '../../services/firestoreService';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

function computePrice(product, qty) {
  if (!product.bulkPricing?.length) return product.price;
  const sorted = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const tier = sorted.find((t) => qty >= t.minQty);
  return tier ? tier.price : product.price;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState(PRODUCTS.find((p) => p.id === id) || null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(!product);
  const [accordionOpen, setAccordionOpen] = useState({ ingredients: true, benefits: false });

  useEffect(() => {
    if (!product) {
      getProduct(id)
        .then((p) => { if (p) setProduct(p); else navigate('/products'); })
        .catch(() => navigate('/products'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <AppNavbar />
        <div className="pd-loading"><div className="spinner" /></div>
      </div>
    );
  }

  if (!product) return null;

  const unitPrice = computePrice(product, qty);
  const total = unitPrice * qty;
  const category = CATEGORIES.find((c) => c.id === product.category);

  function handleAddToCart() {
    addItem(product, qty);
    toast.success(`${qty}x ${product.name} added to cart!`);
  }

  function handleBuyNow() {
    addItem(product, qty);
    navigate('/cart');
  }

  return (
    <div className="product-detail-page">
      <AppNavbar />

      <div className="pd-container">
        <button className="pd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to products
        </button>

        <div className="pd-grid">
          {/* Left: Image */}
          <div className="pd-image-section">
            <div className="pd-image-box">
              {product.image
                ? <img src={product.image} alt={product.name} />
                : <div className="pd-image-emoji">{product.emoji || '🍃'}</div>
              }
            </div>
            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map((t) => (
                  <span key={t} className="pd-tag">#{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="pd-info">
            <div className="pd-info-meta">
              <span className="pd-category">{category?.name}</span>
              {product.subCategory && <span className="pd-sub">{product.subCategory}</span>}
              <span className="pd-rating">
                <Star size={13} fill="currentColor" /> {product.rating || 4.8}
              </span>
            </div>

            <h1 className="pd-title">{product.name}</h1>
            <p className="pd-description">{product.description}</p>

            {/* Pricing */}
            <div className="pd-pricing-box">
              <div className="pd-price-row">
                <span className="pd-price">₹{unitPrice}</span>
                <span className="pd-per">per piece</span>
                {qty > 1 && (
                  <span className="pd-total-hint">
                    ₹{total.toLocaleString('en-IN')} total
                  </span>
                )}
              </div>

              {product.bulkPricing?.length > 0 && (
                <div className="pd-bulk-table">
                  <p className="pd-bulk-label">Bulk Pricing</p>
                  <div className="pd-bulk-tiers">
                    <div className={`pd-tier ${qty < product.bulkPricing[0]?.minQty ? 'active' : ''}`}>
                      <span>1+ pcs</span>
                      <span>₹{product.price}</span>
                    </div>
                    {product.bulkPricing.map((t) => (
                      <div
                        key={t.minQty}
                        className={`pd-tier ${qty >= t.minQty ? 'active' : ''}`}
                      >
                        <span>{t.minQty}+ pcs</span>
                        <span>₹{t.price} <span className="pd-save">Save {Math.round(((product.price - t.price) / product.price) * 100)}%</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="pd-qty-row">
              <label>Quantity</label>
              <div className="pd-qty-selector">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="pd-ctas">
              <button
                className="pd-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>
              <button
                className="pd-buy-btn"
                onClick={handleBuyNow}
                disabled={!product.isAvailable}
              >
                Buy Now
              </button>
            </div>

            {!product.isAvailable && (
              <p className="pd-unavailable-msg">This product is currently unavailable.</p>
            )}

            {/* Accordion sections */}
            {product.ingredients?.length > 0 && (
              <div className="pd-accordion">
                <button
                  className="pd-accordion-header"
                  onClick={() => setAccordionOpen((a) => ({ ...a, ingredients: !a.ingredients }))}
                >
                  Ingredients
                  {accordionOpen.ingredients ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {accordionOpen.ingredients && (
                  <div className="pd-accordion-body">
                    <div className="pd-pills">
                      {product.ingredients.map((ing) => (
                        <span key={ing} className="pd-pill">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.healthBenefits?.length > 0 && (
              <div className="pd-accordion">
                <button
                  className="pd-accordion-header"
                  onClick={() => setAccordionOpen((a) => ({ ...a, benefits: !a.benefits }))}
                >
                  Health Benefits
                  {accordionOpen.benefits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {accordionOpen.benefits && (
                  <div className="pd-accordion-body">
                    {product.healthBenefits.map((b) => (
                      <div key={b} className="pd-benefit">
                        <Check size={15} className="pd-check" /> {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
