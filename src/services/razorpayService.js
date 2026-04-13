/**
 * Razorpay integration service.
 *
 * Flow:
 *   1. Backend creates a Razorpay order (amount in paise) → returns {orderId, amount, currency}
 *   2. Frontend opens Razorpay checkout with that order ID
 *   3. On success, Razorpay returns {razorpay_payment_id, razorpay_order_id, razorpay_signature}
 *   4. Backend verifies signature (HMAC-SHA256) → marks order paid
 *
 * In this client-only setup we call a lightweight Firebase Function / backend endpoint
 * at VITE_BACKEND_URL to create the Razorpay order and verify payment.
 * If you don't have a backend yet, use the mock flow below.
 */

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Load Razorpay checkout script once
function loadScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Create a Razorpay order via your backend.
 * Backend endpoint: POST /api/payments/create-order
 * Body: { amount, currency, orderId }
 * Returns: { razorpayOrderId, amount, currency }
 */
export async function createRazorpayOrder({ amount, orderId }) {
  if (!BACKEND_URL) {
    // Mock for development — replace with real backend call
    console.warn('[Razorpay] No VITE_BACKEND_URL set. Using mock order ID.');
    return { razorpayOrderId: `order_mock_${Date.now()}`, amount, currency: 'INR' };
  }
  const res = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR', orderId }),
  });
  if (!res.ok) throw new Error('Failed to create Razorpay order');
  return res.json();
}

/**
 * Verify payment signature via backend.
 * Backend endpoint: POST /api/payments/verify
 * Returns: { success: boolean }
 */
export async function verifyPayment(payload) {
  if (!BACKEND_URL) {
    console.warn('[Razorpay] Mock verification — always returns success in dev.');
    return { success: true };
  }
  const res = await fetch(`${BACKEND_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * Open the Razorpay checkout modal.
 *
 * @param {object} options
 * @param {number}   options.amount           Total in INR (we convert to paise internally)
 * @param {string}   options.orderId          Your Firestore order ID
 * @param {string}   options.razorpayOrderId  Order ID from Razorpay (from createRazorpayOrder)
 * @param {object}   options.user             { name, email, phone }
 * @param {Function} options.onSuccess        Called with Razorpay payment response
 * @param {Function} options.onFailure        Called with error
 */
export async function openCheckout({ amount, orderId, razorpayOrderId, user, onSuccess, onFailure }) {
  const loaded = await loadScript();
  if (!loaded) {
    onFailure(new Error('Razorpay SDK failed to load. Check your internet connection.'));
    return;
  }

  const options = {
    key: KEY_ID,
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    name: import.meta.env.VITE_APP_NAME || 'The Modern Epicurean',
    description: `Order ${orderId}`,
    order_id: razorpayOrderId,
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.phone || '',
    },
    theme: { color: '#a0813c' },
    modal: { backdropclose: false },
    handler: async (response) => {
      try {
        const verification = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          orderId,
        });
        if (verification.success) {
          onSuccess({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
        } else {
          onFailure(new Error('Payment verification failed.'));
        }
      } catch (err) {
        onFailure(err);
      }
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure(new Error(response.error?.description || 'Payment failed.'));
  });
  rzp.open();
}
