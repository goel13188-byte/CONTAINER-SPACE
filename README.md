# ShipSpace - Container Space Optimization Platform

ShipSpace is a peer-to-peer marketplace designed to connect shippers who have unused container space with people who need to ship goods. The platform turns unused container capacity into revenue while making global shipping more efficient and sustainable.

This project is built with the **MERN stack**:

- **MongoDB Atlas** - database
- **Express.js** - backend API
- **React + Vite** - frontend
- **Node.js** - backend runtime

## 🚀 Live Deployment

### Backend

**Render:** https://container-space.onrender.com

Backend health check:

https://container-space.onrender.com/api/health

Expected response:

```json
{
  "status": "ok",
  "service": "container-space-backend"
}
```

Backend root:

https://container-space.onrender.com/

Expected response:

```json
{
  "status": "ok",
  "message": "Container Space API is running."
}
```

> **Note:** `/api` by itself is not a GET endpoint, so opening `https://container-space.onrender.com/api` may show `Cannot GET /api`. This is expected.

### Frontend

**Vercel:** https://container-space.vercel.app/

The frontend communicates with the deployed backend through:

```
https://container-space.onrender.com/api
```

## ✨ Core Features

- **User Authentication** - JWT-based registration and login.
- **Marketplace** - Browse and filter available container-space listings.
- **Listing Management** - Authenticated users can create, view, and delete their listings.
- **Pricing Tiers** - The Basic plan limits users to 5 free listings.
- **Analytics Dashboard** - Protected dashboard for user statistics.
- **AI Chatbot (ShipBot)** - Gemini-powered assistant for logistics, container space, pricing, and negotiation.
- **MongoDB Atlas** - Persistent cloud database.
- **Responsive React UI** - Vite-powered frontend application.

## 🤖 AI Chatbot Security

ShipBot uses the Gemini API through the **backend**, not directly from the browser.

The Gemini API key must be stored only as a Render environment variable:

```
GEMINI_API_KEY=your_new_gemini_api_key
```

**Never put a Gemini API key directly inside `frontend/src/components/Chatbot.jsx` or commit it to GitHub.**

The frontend sends chat messages to:

```
POST /api/chat
```

The backend then communicates with Gemini using the secret API key.

## 🛠️ Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt.js
- CORS
- dotenv

### Frontend

- React
- Vite
- React Router
- React Context API
- Axios
- Recharts

### AI

- Google Gemini API
- Backend-protected Gemini API integration

### Deployment

- GitHub - source control
- Render - backend deployment
- Vercel - frontend deployment
- MongoDB Atlas - cloud database

## 📁 Project Structure

```
CONTAINER-SPACE/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── chatRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔌 Backend API Routes

| Route | Purpose |
|---|---|
| `GET /` | Backend status |
| `GET /api/health` | Health check |
| `/api/users` | User registration/login |
| `/api/listings` | Container-space listings |
| `/api/analytics` | Analytics endpoints |
| `POST /api/chat` | ShipBot/Gemini chatbot |

## ⚙️ Local Setup

### Prerequisites

Install:

- Node.js 18+
- npm
- MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/goel13188-byte/CONTAINER-SPACE.git
cd CONTAINER-SPACE
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

The local backend runs on:

```
http://localhost:5001
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will display the local frontend URL.

## 🌐 Render Backend Deployment

The backend is deployed on Render as a Node Web Service.

### Render configuration

**Repository:**

```
goel13188-byte/CONTAINER-SPACE
```

**Branch:**

```
main
```

**Root Directory:**

```
backend
```

**Build Command:**

```
npm install
```

**Start Command:**

```
npm start
```

### Render environment variables

Configure these in **Render → Environment**:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

Do not commit these secrets to GitHub.

Render automatically provides the `PORT` environment variable, so a fixed production port does not need to be configured manually.

### MongoDB Atlas network access

For a Render deployment, MongoDB Atlas must allow the deployment to connect.

The project currently uses an Atlas IP access configuration that permits Render connections.

## 🧪 Deployment Verification

After deploying the backend, verify:

### Backend root

```
https://container-space.onrender.com/
```

Expected:

```json
{
  "status": "ok",
  "message": "Container Space API is running."
}
```

### Health check

```
https://container-space.onrender.com/api/health
```

Expected:

```json
{
  "status": "ok",
  "service": "container-space-backend"
}
```

### Render logs

A successful backend deployment should contain messages similar to:

```
MongoDB Connected: ...
Server running in production mode on port ...
Your service is live
```

## 🔐 Security Notes

- Never commit `.env` files.
- Never expose `MONGO_URI`, `JWT_SECRET`, or `GEMINI_API_KEY`.
- Gemini requests are routed through the backend so the API key is not exposed in the frontend.
- If a secret is accidentally exposed, revoke/rotate it immediately.
- Use strong, unique passwords for MongoDB and JWT secrets.

## 📌 Important Deployment Note

Render's free web services can spin down after inactivity. The first request after inactivity may therefore take longer than usual.

## 👨‍💻 Project

**ShipSpace - Container Space Optimization Platform**

Built using the MERN stack with MongoDB Atlas, Render, Vercel, and Gemini AI.



## 👑 Admin Console & Demo Accounts

ShipSpace now includes a protected admin console at:

```
/admin
```

Only users with `role: "admin"` can access it.

The admin console lets you:

- View all registered users.
- See each user's email/login, company, role, verification status and plan.
- Promote a normal user to admin or change an admin back to a user.
- Monitor the number of registered accounts.

### Password security

Passwords are **never displayed** in the admin console. They are stored as bcrypt hashes in MongoDB. If a password needs to be changed, use a controlled password-reset workflow rather than reading the stored hash.

### Seed 12 demo accounts

The backend can create 12 demo accounts automatically when the following Render variables are configured:

```env
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
DEMO_USER_PASSWORD=your_demo_password
SEED_DEMO_USERS=true
```

The demo accounts use these logins:

```
demo01@shipspace.demo
demo02@shipspace.demo
demo03@shipspace.demo
demo04@shipspace.demo
demo05@shipspace.demo
demo06@shipspace.demo
demo07@shipspace.demo
demo08@shipspace.demo
demo09@shipspace.demo
demo10@shipspace.demo
demo11@shipspace.demo
demo12@shipspace.demo
```

All demo accounts use the password configured in `DEMO_USER_PASSWORD`.

After the accounts have been created, set:

```
SEED_DEMO_USERS=false
```

This prevents unnecessary seed checks on future deployments.

### Render variables for the complete project

Your backend environment should contain:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
DEMO_USER_PASSWORD=your_demo_password
SEED_DEMO_USERS=true
```

Never commit these values to GitHub.


## Phase 2 — Marketplace Operations

The marketplace now includes a booking-request workflow, buyer/seller messaging, notifications, and a printable invoice view.

### Booking lifecycle

1. A buyer submits a request from a listing details page.
2. The seller sees it under **Dashboard → Incoming booking requests**.
3. The seller can accept or decline a pending request. Accepting reserves the requested CBM from the listing's available capacity.
4. Buyers can cancel pending or accepted bookings while payment is still unpaid. Cancelling an accepted unpaid request releases its reserved capacity.
5. The dashboard provides a **Pay & confirm** entry point. **Online payment is intentionally disabled for now**; the API does not create payment orders or mark bookings paid. Do not treat an accepted booking as a paid reservation.
6. An invoice view is available only when a booking's payment status has been set to `paid` by a future verified payment integration. It cannot be used to fabricate a paid invoice.

### Messaging and notifications

- Authenticated booking participants can send and read messages at `/messages/:bookingId`.
- The navigation notification inbox shows recent notifications and unread counts.
- Notifications are created for new booking requests, seller decisions, and new messages.
- A user can only read a conversation when they are the buyer or seller on that booking.

### Additional API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/bookings` | Submit a booking request |
| `GET` | `/api/bookings/mine` | Buyer's booking history |
| `GET` | `/api/bookings/incoming` | Seller's incoming requests |
| `PATCH` | `/api/bookings/:id/status` | Accept, decline, or cancel a booking |
| `POST` | `/api/bookings/:id/payment/order` | Reserved payment entry point; currently disabled |
| `POST` | `/api/bookings/:id/payment/verify` | Reserved verification entry point; currently disabled |
| `GET` | `/api/bookings/:id/invoice` | Retrieve a paid booking invoice |
| `GET` | `/api/notifications` | List notifications and unread count |
| `PATCH` | `/api/notifications/:id/read` | Mark one notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read |
| `GET` | `/api/messages/:bookingId` | Read a booking conversation |
| `POST` | `/api/messages/:bookingId` | Send a message in a booking conversation |
| `GET` | `/api/messages/unread-count` | Count unread messages |

All booking, notification, and messaging endpoints require a valid JWT bearer token. Payment is deliberately not enabled until a gateway is configured and payment signatures can be verified server-side.


## 💸 Platform commission and owner analytics

The protected admin console includes platform-wide booking analytics at `GET /api/admin/analytics`. It shows verified paid transaction value, commission actually earned, active unpaid booking value, estimated potential commission, and recent booking activity.

The default platform commission is **2%** and can be changed in Render → Environment:

```env
PLATFORM_FEE_PERCENT=2
```

Allowed values are 0–10. The dashboard calculates actual commission only for bookings whose status is `confirmed` and payment status is `paid`. Pending or accepted unpaid requests appear only as an estimate and are **not revenue**. Since checkout/payment verification is currently disabled, actual commission remains zero until a real payment integration is implemented and verifies payments. Do not mark demo bookings as paid to inflate revenue analytics.

## 🤖 ShipBot troubleshooting

Check:

```
https://container-space.onrender.com/api/chat/health
```

A correctly configured response includes:

```json
{
  "status": "ok",
  "configured": true,
  "model": "gemini-3.8-flash"
}
```

If `configured` is `false`, add `GEMINI_API_KEY` to Render → Environment and redeploy.

ShipBot uses Google's Gemini API from the backend so the API key is not exposed in the browser. The current integration uses `gemini-3.8-flash`. Google recommends environment variables for API keys and documents the REST `generateContent` endpoint and `x-goog-api-key` authentication in its Gemini API documentation.
