/**
 * Firestore service — all database operations live here.
 * Collections: users, products, categories, orders, payments
 */
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  addDoc, query, where, orderBy, limit, serverTimestamp,
  deleteDoc, increment, writeBatch, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const col = (name) => collection(db, name);
const ref = (col, id) => doc(db, col, id);

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(uid, data) {
  const userRef = ref('users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      ...data,
      role: 'customer',
      addresses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  }
}

export async function getUser(uid) {
  const snap = await getDoc(ref('users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(ref('users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function addAddress(uid, address) {
  const userSnap = await getDoc(ref('users', uid));
  const existing = userSnap.data().addresses || [];
  const newAddress = { id: Date.now().toString(), ...address };
  await updateDoc(ref('users', uid), {
    addresses: [...existing, newAddress],
    updatedAt: serverTimestamp(),
  });
  return newAddress;
}

export async function getAllUsers() {
  const q = query(col('users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const snap = await getDocs(query(col('categories'), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function upsertCategory(data, id = null) {
  if (id) {
    await updateDoc(ref('categories', id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const docRef = await addDoc(col('categories'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function deleteCategory(id) {
  await deleteDoc(ref('categories', id));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters = {}) {
  let q = col('products');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.category) constraints.unshift(where('category', '==', filters.category));
  if (filters.isAvailable !== undefined) constraints.unshift(where('isAvailable', '==', filters.isAvailable));

  q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id) {
  const snap = await getDoc(ref('products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProduct(data) {
  const docRef = await addDoc(col('products'), {
    ...data,
    isAvailable: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  await updateDoc(ref('products', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  await deleteDoc(ref('products', id));
}

export async function toggleProductAvailability(id, current) {
  await updateDoc(ref('products', id), {
    isAvailable: !current,
    updatedAt: serverTimestamp(),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder({ userId, items, totalAmount, deliveryAddress, paymentMethod }) {
  const orderData = {
    userId,
    orderNumber: generateOrderNumber(),
    items,
    totalAmount,
    deliveryAddress,
    paymentMethod,
    status: 'pending',
    paymentStatus: 'pending',
    razorpayOrderId: null,
    razorpayPaymentId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(col('orders'), orderData);
  return { id: docRef.id, ...orderData };
}

export async function getOrder(id) {
  const snap = await getDoc(ref('orders', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserOrders(userId) {
  const q = query(col('orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllOrders() {
  const q = query(col('orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(id, status) {
  await updateDoc(ref('orders', id), { status, updatedAt: serverTimestamp() });
}

export async function markOrderPaid(orderId, { razorpayPaymentId, razorpayOrderId, razorpaySignature }) {
  await updateDoc(ref('orders', orderId), {
    paymentStatus: 'paid',
    status: 'processing',
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markOrderFailed(orderId) {
  await updateDoc(ref('orders', orderId), {
    paymentStatus: 'failed',
    updatedAt: serverTimestamp(),
  });
}

// ─── Analytics (admin) ────────────────────────────────────────────────────────

export async function getAnalyticsSummary() {
  const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
    getDocs(col('orders')),
    getDocs(col('users')),
    getDocs(col('products')),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data());
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Top products by quantity sold
  const productMap = {};
  paidOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productMap[item.productId].qty += item.quantity;
      productMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.entries(productMap)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    totalRevenue,
    totalUsers: usersSnap.size,
    totalProducts: productsSnap.size,
    topProducts,
  };
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

export function subscribeToUserOrders(userId, callback) {
  const q = query(col('orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToAllOrders(callback) {
  const q = query(col('orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
