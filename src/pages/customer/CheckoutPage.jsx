import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, Plus } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { createOrder, markOrderPaid, markOrderFailed } from '../../services/firestoreService';
import { createRazorpayOrder, openCheckout } from '../../services/razorpayService';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const STEPS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clearCart } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal);
  const discount = useCartStore((s) => s.discount);
  const total = useCartStore((s) => s.total);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses?.[0] || null
  );
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', state: '', pincode: '' });
  const [addingAddr, setAddingAddr] = useState(!user?.addresses?.length);
  const [paying, setPaying] = useState(false);

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  function handleAddrChange(e) {
    setNewAddr((a) => ({ ...a, [e.target.name]: e.target.value }));
  }

  function handleAddrSubmit(e) {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      toast.error('Please fill all address fields.');
      return;
    }
    setSelectedAddress(newAddr);
    setAddingAddr(false);
    setStep(1);
  }

  async function handlePayWithRazorpay() {
    if (!selectedAddress) { toast.error('Please select a delivery address.'); return; }
    setPaying(true);

    try {
      // 1. Create order in Firestore
      const order = await createOrder({
        userId: user.uid,
        items: items.map(({ product, quantity, unitPrice, subtotal: s }) => ({
          productId: product.id,
          name: product.name,
          emoji: product.emoji,
          unitPrice,
          quantity,
          subtotal: s,
        })),
        totalAmount: total,
        deliveryAddress: selectedAddress,
        paymentMethod: 'razorpay',
      });

      // 2. Create Razorpay order via backend
      const { razorpayOrderId } = await createRazorpayOrder({
        amount: total,
        orderId: order.id,
      });

      // 3. Open Razorpay checkout
      await openCheckout({
        amount: total,
        orderId: order.id,
        razorpayOrderId,
        user: { name: user.name, email: user.email, phone: user.phone },
        onSuccess: async (paymentDetails) => {
          await markOrderPaid(order.id, paymentDetails);
          clearCart();
          toast.success('Payment successful! Order confirmed.');
          navigate(`/orders/${order.id}`);
        },
        onFailure: async (err) => {
          await markOrderFailed(order.id);
          toast.error(err.message || 'Payment failed. Please try again.');
          setPaying(false);
        },
      });
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setPaying(false);
    }
  }

  return (
    <div className="checkout-page">
      <AppNavbar />
      <div className="checkout-container">
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`checkout-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="step-arrow" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Step 0: Address */}
            {step === 0 && (
              <div className="checkout-section">
                <h2><MapPin size={18} /> Delivery Address</h2>

                {/* Saved addresses */}
                {(user?.addresses || []).map((addr) => (
                  <label key={addr.id} className={`addr-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => { setSelectedAddress(addr); setAddingAddr(false); }}
                    />
                    <div>
                      <strong>{addr.label || 'Address'}</strong>
                      <p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}

                {!addingAddr && (
                  <button className="add-addr-btn" onClick={() => setAddingAddr(true)}>
                    <Plus size={15} /> Add New Address
                  </button>
                )}

                {addingAddr && (
                  <form className="addr-form" onSubmit={handleAddrSubmit}>
                    <div className="form-row">
                      <input name="label" placeholder="Label (e.g. Restaurant)" value={newAddr.label} onChange={handleAddrChange} />
                    </div>
                    <div className="form-row">
                      <input name="street" placeholder="Street address *" value={newAddr.street} onChange={handleAddrChange} required />
                    </div>
                    <div className="form-row-2">
                      <input name="city" placeholder="City *" value={newAddr.city} onChange={handleAddrChange} required />
                      <input name="state" placeholder="State" value={newAddr.state} onChange={handleAddrChange} />
                    </div>
                    <div className="form-row">
                      <input name="pincode" placeholder="Pincode *" value={newAddr.pincode} onChange={handleAddrChange} required maxLength={6} />
                    </div>
                    <div className="form-btns">
                      <button type="submit" className="btn-primary">Use this address</button>
                      {user?.addresses?.length > 0 && (
                        <button type="button" className="btn-ghost" onClick={() => setAddingAddr(false)}>Cancel</button>
                      )}
                    </div>
                  </form>
                )}

                {selectedAddress && !addingAddr && (
                  <button className="btn-primary" style={{ marginTop: '1.25rem', width: '100%' }} onClick={() => setStep(1)}>
                    Continue to Payment
                  </button>
                )}
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="checkout-section">
                <h2><CreditCard size={18} /> Payment</h2>

                <div className="selected-addr-preview">
                  <MapPin size={13} />
                  <span>{selectedAddress.street}, {selectedAddress.city} - {selectedAddress.pincode}</span>
                  <button onClick={() => setStep(0)}>Change</button>
                </div>

                <div className="payment-method-card selected">
                  <div className="razorpay-logo">
                    <span>💳</span>
                    <div>
                      <strong>Razorpay</strong>
                      <p>UPI, Cards, Net Banking, Wallets</p>
                    </div>
                  </div>
                  <span className="method-check">✓</span>
                </div>

                <div className="payment-features">
                  {['256-bit SSL encryption', 'Razorpay signature verification', 'Instant payment confirmation'].map((f) => (
                    <div key={f} className="payment-feature">✅ {f}</div>
                  ))}
                </div>

                <button
                  className="btn-pay"
                  onClick={handlePayWithRazorpay}
                  disabled={paying}
                >
                  {paying ? 'Processing…' : `Pay ₹${total.toLocaleString('en-IN')}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="checkout-items">
              {items.map(({ product, quantity, unitPrice, subtotal: s }) => (
                <div key={product.id} className="co-item">
                  <span className="co-item-emoji">{product.emoji || '🍃'}</span>
                  <span className="co-item-name">{product.name} × {quantity}</span>
                  <span className="co-item-price">₹{s.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="checkout-divider" />
            <div className="co-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discount > 0 && (
              <div className="co-row co-discount"><span>Discount</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>
            )}
            <div className="co-row"><span>Delivery</span><span className="co-free">Free</span></div>
            <div className="checkout-divider" />
            <div className="co-row co-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
