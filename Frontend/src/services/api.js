/**
 * Centralized API client for IntentCartAI Frontend
 * Automatically routes through Vite proxy (/api) and falls back directly to http://localhost:3000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DIRECT_BACKEND_URL = 'http://localhost:3000/api';

export async function apiRequest(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const relativeUrl = `${API_BASE_URL}${cleanPath}`;
  const directUrl = `${DIRECT_BACKEND_URL}${cleanPath}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const reqOptions = {
    ...options,
    headers
  };

  // Try relative proxy route first
  try {
    const res = await fetch(relativeUrl, reqOptions);
    // If proxy responds (even 4xx/5xx responses from backend), return it
    if (res.status !== 404 && res.status !== 502 && res.status !== 504) {
      return res;
    }
  } catch (err) {
    console.warn(`[API] Relative request failed for ${relativeUrl}, trying direct backend:`, err.message);
  }

  // Fallback to direct backend URL
  return await fetch(directUrl, reqOptions);
}

// Authentication APIs
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

// AI & Bundles APIs (Comprehensive mapping of all ai.route.js endpoints)
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

  // POST /api/ai/aiEfficientSearch (Direct 1-step AI bundle generation without saved ID)
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

  // GET /api/ai/bundles (Fetches latest requirement & Mistral AI generated bundles)
  getLatestBundles: () =>
    apiRequest('/ai/bundles', {
      method: 'GET'
    }),

  // General bundles handler
  getBundlesPage: (requirementId) =>
    apiRequest(requirementId ? `/ai/bundles/${requirementId}` : '/ai/bundles', {
      method: 'GET'
    })
};

// Products APIs
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

// Payment APIs
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
