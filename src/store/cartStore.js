/**
 * Zustand cart store — persisted to localStorage.
 * Supports bulk pricing: price changes based on quantity tiers.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function computeUnitPrice(product, quantity) {
  if (!product.bulkPricing || product.bulkPricing.length === 0) return product.price;
  // Find the highest tier the quantity qualifies for
  const sorted = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const tier = sorted.find((t) => quantity >= t.minQty);
  return tier ? tier.price : product.price;
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // [{ product, quantity, unitPrice, subtotal }]
      coupon: null,    // { code, discount, type: 'percent' | 'flat' }

      addItem(product, quantity = 1) {
        const { items } = get();
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          get().updateQuantity(product.id, existing.quantity + quantity);
        } else {
          const unitPrice = computeUnitPrice(product, quantity);
          set({ items: [...items, { product, quantity, unitPrice, subtotal: unitPrice * quantity }] });
        }
      },

      updateQuantity(productId, quantity) {
        if (quantity < 1) { get().removeItem(productId); return; }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.product.id !== productId) return i;
            const unitPrice = computeUnitPrice(i.product, quantity);
            return { ...i, quantity, unitPrice, subtotal: unitPrice * quantity };
          }),
        }));
      },

      removeItem(productId) {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }));
      },

      clearCart() {
        set({ items: [], coupon: null });
      },

      applyCoupon(coupon) {
        set({ coupon });
      },

      removeCoupon() {
        set({ coupon: null });
      },

      get subtotal() {
        return get().items.reduce((s, i) => s + i.subtotal, 0);
      },

      get discount() {
        const { coupon, items } = get();
        if (!coupon) return 0;
        const sub = items.reduce((s, i) => s + i.subtotal, 0);
        if (coupon.type === 'percent') return Math.round((sub * coupon.discount) / 100);
        return coupon.discount;
      },

      get total() {
        const sub = get().items.reduce((s, i) => s + i.subtotal, 0);
        return sub - get().discount;
      },

      get itemCount() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    { name: 'paan-cart' }
  )
);
