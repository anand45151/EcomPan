# The Modern Epicurean — B2B Paan Ordering Platform

A production-ready B2B wholesale ordering platform for a premium paan business. Restaurants, cafes, and bulk buyers can browse the catalogue, place bulk orders, and pay securely via Razorpay — all through a clean, mobile-responsive web app.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Firebase Setup](#firebase-setup)
6. [Google OAuth Setup](#google-oauth-setup)
7. [Razorpay Setup](#razorpay-setup)
8. [Environment Configuration](#environment-configuration)
9. [Running Locally](#running-locally)
10. [Setting Up Your Admin Account](#setting-up-your-admin-account)
11. [Firestore Security Rules](#firestore-security-rules)
12. [Razorpay Backend](#razorpay-backend)
13. [Deploying to Vercel](#deploying-to-vercel)
14. [Features Reference](#features-reference)
15. [Data Model](#data-model)
16. [Troubleshooting](#troubleshooting)

---

## Project Overview

| | |
|---|---|
| **Business** | B2B paan wholesale (restaurants, cafes, bulk buyers) |
| **Auth** | Google OAuth — sign in with your business Google account |
| **Database** | Firebase Firestore — real-time, cloud-hosted |
| **Payments** | Razorpay — UPI, cards, net banking, wallets |
| **Frontend** | React 19 + Vite, vanilla CSS, React Router v6 |
| **State** | Zustand (cart persisted in localStorage) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + Vite 8 |
| Routing | React Router v6 |
| Cart state | Zustand (localStorage persisted) |
| Authentication | Firebase Auth (Google OAuth) |
| Database | Firebase Firestore |
| File storage | Firebase Storage (for product images) |
| Payments | Razorpay |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Forms | React Hook Form + Zod |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
anand/
├── .env.example                    ← Copy to .env and fill in your keys
├── .env                            ← Your actual secrets (never commit this)
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                    Entry point
    ├── App.jsx                     Router + AuthProvider wrapper
    ├── index.css                   Global design tokens (CSS variables)
    │
    ├── firebase/
    │   └── config.js               Firebase app initialization
    │
    ├── context/
    │   └── AuthContext.jsx         Google login, session, Firestore user sync
    │
    ├── store/
    │   └── cartStore.js            Zustand cart — bulk pricing logic included
    │
    ├── services/
    │   ├── firestoreService.js     All database operations (users, products, orders)
    │   └── razorpayService.js      Payment flow (create order → checkout → verify)
    │
    ├── data/
    │   └── products.js             Seed data — 6 products, 3 categories, 2 coupons
    │
    ├── components/
    │   ├── AppNavbar.jsx           Navbar for authenticated pages
    │   ├── ui/ProtectedRoute.jsx   RequireAuth + RequireAdmin guards
    │   ├── Navbar.jsx              Landing page navbar
    │   ├── Hero.jsx
    │   ├── Craftsmanship.jsx
    │   ├── Collections.jsx
    │   ├── Partnerships.jsx
    │   ├── Heritage.jsx
    │   └── Footer.jsx
    │
    └── pages/
        ├── LandingPage.jsx         Public marketing homepage
        ├── LoginPage.jsx           Google OAuth login
        │
        ├── customer/
        │   ├── ProductsPage.jsx        Catalogue — search, filter, sort
        │   ├── ProductDetailPage.jsx   Bulk pricing tiers, add to cart
        │   ├── CartPage.jsx            Cart with coupon code support
        │   ├── CheckoutPage.jsx        Address → Razorpay → confirmation
        │   ├── OrdersPage.jsx          Order history + reorder
        │   ├── OrderDetailPage.jsx     Live order status tracker
        │   └── ProfilePage.jsx         Business details + addresses
        │
        └── admin/
            ├── AdminLayout.jsx     Sidebar shell
            ├── AdminDashboard.jsx  Revenue, orders, top-product stats
            ├── AdminProducts.jsx   Product CRUD + availability toggle
            ├── AdminOrders.jsx     Real-time orders + status updates
            └── AdminUsers.jsx      Business client directory
```

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- A **Google account** (for Firebase)
- A **Razorpay account** — [razorpay.com](https://razorpay.com) (free test account is fine to start)

Verify your versions:

```bash
node --version    # should be v18+
npm --version     # should be v9+
```

---

## Firebase Setup

Firebase is the backend for this app — it handles authentication, the database, and file storage for product images.

### Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter a project name (e.g. `modern-epicurean-prod`)
4. Disable Google Analytics if you don't need it
5. Click **Create project**

### Step 2 — Register a Web App

1. On the project overview page, click the **`</>`** (Web) icon
2. Enter an app nickname (e.g. `paan-web`)
3. Click **Register app**
4. You will see a `firebaseConfig` object — **copy these values** into your `.env` file

```js
// You'll see something like this — copy each value into .env
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3 — Enable Firestore

1. In the Firebase console left sidebar, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a region close to your users — **`asia-south1`** is recommended for India
5. Click **Done**

### Step 4 — Enable Firebase Storage (for product images)

1. In the left sidebar, go to **Build → Storage**
2. Click **Get started**
3. Accept the default security rules for now
4. Click **Done**

---

## Google OAuth Setup

Google OAuth is how all your B2B clients log in. Firebase handles the full OAuth flow for you.

### Step 1 — Enable Google Sign-In

1. Firebase Console → **Build → Authentication**
2. Click **Get started**
3. Click the **Sign-in method** tab
4. Click **Google**
5. Toggle **Enable** to on
6. Enter a **Project support email** (your email address)
7. Click **Save**

### Step 2 — Add Authorized Domains

`localhost` is already authorized for development. For production, add your deployment domain:

1. Still in **Authentication**, click the **Settings** tab
2. Click **Authorized domains**
3. Click **Add domain**
4. Enter your production domain (e.g. `modern-epicurean.vercel.app`)
5. Click **Add**

---

## Razorpay Setup

Razorpay processes payments — UPI, debit/credit cards, net banking, and wallets.

### Step 1 — Create a Razorpay Account

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC when ready for live payments (test mode works without KYC)

### Step 2 — Get Your API Keys

1. Razorpay Dashboard → **Settings → API Keys**
2. Click **Generate Test Key**
3. You get two values:
   - **Key ID** — starts with `rzp_test_` — goes into your `.env`
   - **Key Secret** — keep this **server-side only**, never in the frontend

### Step 3 — Switch to Live Mode for Production

1. Complete Razorpay KYC verification
2. Go to **Settings → API Keys → Live Mode**
3. Generate live keys (start with `rzp_live_`)
4. Update your production environment variables

---

## Environment Configuration

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and fill in every value:

```env
# ── Firebase ──────────────────────────────────────────
# Get these from: Firebase Console → Project Settings → Your apps → Web app
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ── Razorpay ──────────────────────────────────────────
# Get this from: Razorpay Dashboard → Settings → API Keys
# Use rzp_test_ keys for development, rzp_live_ for production
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# ── Backend URL ────────────────────────────────────────
# URL of your Razorpay backend server (see "Razorpay Backend" section)
# Leave empty during initial development — the app uses a safe mock flow
VITE_BACKEND_URL=https://your-backend.onrender.com

# ── App Config ─────────────────────────────────────────
VITE_APP_NAME=The Modern Epicurean
VITE_ADMIN_EMAIL=your-email@gmail.com
```

> **Never commit `.env` to git.** It is already listed in `.gitignore`.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment variables
cp .env.example .env
# Open .env and fill in your Firebase + Razorpay values

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Useful Commands

```bash
npm run build      # Production build — outputs to dist/
npm run preview    # Preview the production build locally on port 4173
npm run lint       # Run ESLint across all source files
```

---

## Setting Up Your Admin Account

The admin dashboard at `/admin` is only accessible to users whose Firestore profile has `role: "admin"`. Here is how to set that up the first time:

1. Run the app and sign in with your Google account
2. Open [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database**
3. Click the **users** collection in the left panel
4. Find your document — it is named with your Google UID (a long string of letters and numbers)
5. Click the document to open it
6. Find the `role` field (it will say `"customer"`)
7. Click the pencil icon next to it → change the value to `"admin"` → click **Update**

Sign out and sign back in. You will now see the **Admin** link in the navigation bar and can access all admin pages at `/admin`.

---

## Firestore Security Rules

Paste these rules in Firebase Console → **Firestore Database → Rules** tab, then click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if the current user is an admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users: read/write own profile; admins can read all profiles
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null && isAdmin();
    }

    // Products: any authenticated user can read; only admins can create/update/delete
    match /products/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }

    // Categories: same as products
    match /categories/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }

    // Orders: users can create and read/update their own; admins can read/update all
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
    }
  }
}
```

---

## Razorpay Backend

The frontend cannot safely verify payment signatures — that must happen on a server to prevent fraud. You need a small backend with two endpoints.

### Option A — Simple Express Server (recommended for starters)

Create a new folder alongside the frontend (e.g. `backend/`) with this `server.js`:

```js
require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto  = require('crypto');
const cors    = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Called before opening the Razorpay checkout modal
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;
    const order = await razorpay.orders.create({
      amount,          // in paise — multiply rupees × 100 before sending
      currency,
      receipt: orderId,
    });
    res.json({ razorpayOrderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Called after user pays — verifies the HMAC signature to confirm authenticity
app.post('/api/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  res.json({ success: expected === razorpay_signature });
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`Payment server running on port ${process.env.PORT || 3001}`)
);
```

Backend `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
PORT=3001
```

```bash
npm init -y
npm install express razorpay cors dotenv
node server.js
```

Then set `VITE_BACKEND_URL=http://localhost:3001` in your frontend `.env`.

### Option B — Firebase Cloud Functions

You can implement the same two endpoints as Firebase Functions and keep everything in one Firebase project. See [Firebase Functions documentation](https://firebase.google.com/docs/functions).

### Development Without a Backend

During early development, if `VITE_BACKEND_URL` is not set, the app uses a **mock payment flow** — orders are created in Firestore and the payment step is skipped automatically. This lets you test the entire UI without a running backend.

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your repository
4. Vercel auto-detects Vite. Confirm these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3 — Add Environment Variables

In Vercel's project settings → **Environment Variables**, add all the same variables from your `.env`:

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same |
| `VITE_FIREBASE_PROJECT_ID` | Same |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same |
| `VITE_FIREBASE_APP_ID` | Same |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `VITE_BACKEND_URL` | Your deployed backend URL |
| `VITE_APP_NAME` | e.g. `The Modern Epicurean` |

### Step 4 — Authorize Your Domain in Firebase

After Vercel gives you a URL (e.g. `modern-epicurean.vercel.app`):

1. Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **Add domain** → enter your Vercel URL → click **Add**

### Step 5 — Deploy

Click **Deploy**. Every subsequent `git push` to `main` triggers an automatic redeploy.

---

## Features Reference

### Customer App

| Feature | Route |
|---|---|
| Public landing page | `/` |
| Google login | `/login` |
| Product catalogue — search, filter by category, sort by price/rating | `/products` |
| Product detail with bulk pricing tiers | `/products/:id` |
| Cart with coupon codes | `/cart` |
| Checkout — address → Razorpay payment | `/checkout` |
| Order history with real-time updates | `/orders` |
| Order detail with live status tracker | `/orders/:id` |
| Business profile and delivery addresses | `/profile` |

### Admin Dashboard

| Feature | Route |
|---|---|
| Analytics — revenue, order counts, top products | `/admin` |
| Product CRUD — create, edit, delete, toggle availability | `/admin/products` |
| Order management — real-time feed, update status | `/admin/orders` |
| Business client directory | `/admin/users` |

### Coupon Codes (pre-loaded for testing)

| Code | Effect |
|---|---|
| `WELCOME10` | 10% off the entire order |
| `BULK50` | ₹50 flat discount |

### Bulk Pricing Example

Each product has configurable price tiers. The cart automatically applies the best price based on quantity:

| Quantity | Price per piece (Classic Sada Paan) |
|---|---|
| 1 – 49 | ₹15 |
| 50 – 199 | ₹13 |
| 200+ | ₹11 |

---

## Data Model

The app uses five Firestore collections:

```
users/{uid}
  email           string
  name            string
  photoURL        string
  role            'customer' | 'admin'
  businessName    string
  phone           string
  gstin           string
  addresses       [{ id, label, street, city, state, pincode }]
  createdAt       timestamp
  updatedAt       timestamp

products/{productId}
  name            string
  category        'sada' | 'meetha' | 'premium'
  subCategory     string
  description     string
  emoji           string
  ingredients     string[]
  healthBenefits  string[]
  price           number  (base price per piece in ₹)
  bulkPricing     [{ minQty: number, price: number }]
  tags            string[]
  isAvailable     boolean
  rating          number
  image           string  (Firebase Storage URL)
  createdAt       timestamp
  updatedAt       timestamp

categories/{categoryId}
  name            string
  slug            string
  description     string
  order           number

orders/{orderId}
  userId          string
  orderNumber     string  (e.g. ORD-ABC123-XY12)
  status          'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus   'pending' | 'paid' | 'failed'
  items           [{ productId, name, emoji, unitPrice, quantity, subtotal }]
  totalAmount     number
  deliveryAddress { label, street, city, state, pincode }
  paymentMethod   string
  razorpayOrderId   string
  razorpayPaymentId string
  razorpaySignature string
  createdAt       timestamp
  updatedAt       timestamp
  paidAt          timestamp
```

---

## Troubleshooting

**Google sign-in popup closes without logging in**
Your domain is not in Firebase's authorized list. Add `localhost` for dev or your production URL in Firebase Console → Authentication → Settings → Authorized domains.

**`FirebaseError: Missing or insufficient permissions`**
Your Firestore security rules are not configured. Paste the rules from the [Firestore Security Rules](#firestore-security-rules) section and click Publish.

**Razorpay checkout does not open**
Check that `VITE_RAZORPAY_KEY_ID` is set in `.env` and starts with `rzp_test_` or `rzp_live_`. Check the browser console for errors.

**Admin link is not visible after login**
Your Firestore user document's `role` is still `"customer"`. Follow the steps in [Setting Up Your Admin Account](#setting-up-your-admin-account).

**Environment variables not working in production (Vercel)**
All variables must be added in Vercel's project settings under Environment Variables — not just in your local `.env`. Redeploy after adding them.

**Cart is empty after page refresh**
The cart is stored in `localStorage`. Some browsers block localStorage in private/incognito mode. Test in a normal browser window.

**`npm run build` fails**
Run `npm install` first to ensure all dependencies are present, then run the build again.
