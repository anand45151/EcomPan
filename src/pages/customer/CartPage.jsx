import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Tag, X, ArrowRight } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useCartStore } from '../../store/cartStore';
import { COUPONS } from '../../data/products';
import toast from 'react-hot-toast';
import './CartPage.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, coupon, applyCoupon, removeCoupon } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal);
  const discount = useCartStore((s) => s.discount);
  const total = useCartStore((s) => s.total);
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  function handleApplyCoupon() {
    const c = COUPONS[couponCode.toUpperCase().trim()];
    if (!c) { toast.error('Invalid coupon code.'); return; }
    applyCoupon(c);
    toast.success(`Coupon "${c.code}" applied!`);
    setCouponCode('');
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <AppNavbar />
        <div className="cart-empty">
          <ShoppingBag size={64} strokeWidth={1} />
          <h2>Your cart is empty</h2>
          <p>Add some premium paan to your cart to get started.</p>
          <Link to="/products" className="cart-empty-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <AppNavbar />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="cart-clear" onClick={() => { clearCart(); toast.success('Cart cleared.'); }}>
            Clear all
          </button>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(({ product, quantity, unitPrice, subtotal: itemSub }) => (
              <div key={product.id} className="cart-item">
                <div className="cart-item-image">
                  {product.image
                    ? <img src={product.image} alt={product.name} />
                    : <span>{product.emoji || '🍃'}</span>
                  }
                </div>

                <div className="cart-item-info">
                  <Link to={`/products/${product.id}`} className="cart-item-name">{product.name}</Link>
                  <p className="cart-item-price">₹{unitPrice} / piece</p>
                  {product.bulkPricing?.length > 0 && unitPrice < product.price && (
                    <span className="cart-bulk-tag">Bulk price applied</span>
                  )}
                </div>

                <div className="cart-item-qty">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                </div>

                <div className="cart-item-subtotal">₹{itemSub.toLocaleString('en-IN')}</div>

                <button
                  className="cart-item-remove"
                  onClick={() => { removeItem(product.id); toast.success('Item removed.'); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            {/* Coupon */}
            <div className="cart-coupon">
              <div className="cart-coupon-input">
                <Tag size={15} />
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button onClick={handleApplyCoupon}>Apply</button>
              </div>
              {coupon && (
                <div className="cart-coupon-applied">
                  <span>✅ {coupon.code} — {coupon.type === 'percent' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}</span>
                  <button onClick={removeCoupon}><X size={13} /></button>
                </div>
              )}
              <p className="cart-coupon-hint">Try: WELCOME10 or BULK50</p>
            </div>

            <div className="cart-totals">
              <div className="cart-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="cart-row cart-discount">
                  <span>Discount</span>
                  <span>−₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="cart-row">
                <span>Delivery</span>
                <span className="cart-free">Free</span>
              </div>
              <div className="cart-divider" />
              <div className="cart-row cart-total">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={17} />
            </button>

            <Link to="/products" className="cart-continue">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
