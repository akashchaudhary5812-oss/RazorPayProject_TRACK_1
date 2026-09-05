/**
 * Centralized API client for IntentCartAI
 *
 * How the base URL is resolved (in order of priority):
 *   1. VITE_API_BASE_URL environment variable (set this in Vercel dashboard for production)
 *   2. Falls back to '/api' which is proxied to the backend by Vite during local development
 *
 * Production setup (Vercel → Environment Variables):
 *   VITE_API_URL = https://razorpayproject-track-1.onrender.com/api
 *
 * Local development:
 *   Vite proxy in vite.config.js forwards '/api' → 'http://localhost:3000'
 *   No env variable needed locally.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper — all API calls go through here.
 * @param {string} path  - e.g. '/login', '/ai/bundles'
 * @param {RequestInit} options
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  return response;
}

// ─── Authentication ────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userName, email, password) =>
    apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ userName, email, password })
    }),

  sendOtp: (email, type) =>
    apiRequest('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    }),

  resendOtp: (email, type) =>
    apiRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    }),

  verifyOtp: (email, otp) =>
    apiRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),

  forgotPassword: (email) =>
    apiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  verifyResetOtp: (email, otp) =>
    apiRequest('/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),

  resetPassword: (email, resetToken, newPassword, confirmPassword) =>
    apiRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword, confirmPassword })
    })
};

// ─── AI & Bundles ──────────────────────────────────────────────────────────────

export const aiApi = {
  // POST /api/ai/userRequirements
  submitRequirements: (payload) =>
    apiRequest('/ai/userRequirements', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // GET /api/ai/aiEfficientSearch/:id
  getAiBundles: (requirementId) =>
    apiRequest(`/ai/aiEfficientSearch/${requirementId}`, {
      method: 'GET'
    }),

  // POST /api/ai/aiEfficientSearch/:id
  postAiBundlesWithId: (requirementId, payload = {}) =>
    apiRequest(`/ai/aiEfficientSearch/${requirementId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // POST /api/ai/aiEfficientSearch
  directAiSearch: (payload) =>
    apiRequest('/ai/aiEfficientSearch', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // GET /api/ai/bundles/:id
  getBundlesById: (requirementId) =>
    apiRequest(`/ai/bundles/${requirementId}`, {
      method: 'GET'
    }),

  // GET /api/ai/bundles
  getLatestBundles: () =>
    apiRequest('/ai/bundles', {
      method: 'GET'
    }),

  getBundlesPage: (requirementId) =>
    apiRequest(requirementId ? `/ai/bundles/${requirementId}` : '/ai/bundles', {
      method: 'GET'
    })
};

// ─── Products ──────────────────────────────────────────────────────────────────

export const productApi = {
  getAllProducts: () =>
    apiRequest('/products/products', {
      method: 'GET'
    }),

  getProductById: (id) =>
    apiRequest(`/products/product/${id}`, {
      method: 'GET'
    })
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentApi = {
  getKey: () =>
    apiRequest('/getKey', {
      method: 'GET'
    }),

  processPayment: (amountInPaise) =>
    apiRequest('/payment/process', {
      method: 'POST',
      body: JSON.stringify({ amount: amountInPaise })
    })
};
