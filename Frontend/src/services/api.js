/**
 * Centralized API client for IntentCartAI
 *
 * URL Resolution Strategy:
 *   - Production (Vercel): Set VITE_API_URL in Vercel dashboard
 *     Example: VITE_API_URL = https://razorpayproject-track-1.onrender.com/api
 *   - Local dev: Falls back to '/api', proxied by Vite to localhost:3000
 *
 * NOTE: VITE_API_URL must NOT have a trailing slash.
 */

// Strip trailing slash defensively so URLs always compose cleanly
const RAW_BASE = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

/**
 * Core fetch wrapper. All API calls go through this.
 * @param {string} path - e.g. '/login', '/getKey', '/ai/bundles'
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
export async function apiRequest(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

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
  submitRequirements: (payload) =>
    apiRequest('/ai/userRequirements', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAiBundles: (requirementId) =>
    apiRequest(`/ai/aiEfficientSearch/${requirementId}`, {
      method: 'GET'
    }),

  postAiBundlesWithId: (requirementId, payload = {}) =>
    apiRequest(`/ai/aiEfficientSearch/${requirementId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  directAiSearch: (payload) =>
    apiRequest('/ai/aiEfficientSearch', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getBundlesById: (requirementId) =>
    apiRequest(`/ai/bundles/${requirementId}`, {
      method: 'GET'
    }),

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
