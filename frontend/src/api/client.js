import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const isAdminRequest = (url) => {
  if (!url) return false;
  return url.includes("/admin/") || url.includes("/auth/admin/");
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const authToken = isAdminRequest(config.url) ? adminToken : userToken;

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || "";
      const isAdminError = isAdminRequest(requestUrl);
      if (isAdminError) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      const redirectTarget =
        isAdminError || window.location.pathname.startsWith("/admin")
          ? "/admin/login"
          : "/login";
      if (window.location.pathname !== redirectTarget) {
        window.location.href = redirectTarget;
      }
    }
    return Promise.reject(err);
  },
);

export default api;

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  adminLogin: (data) => api.post("/auth/admin/login", data),
  adminRegister: (data) => api.post("/auth/admin/register", data),
  adminLogout: () => api.post("/auth/admin/logout"),
  logout: () => api.post("/auth/logout"),
};

// ── Products ──────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getOne: (id) => api.get(`/products/${id}`),
};

// ── Cart ─────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get("/cart"),
  add: (productId) => api.post(`/cart/add/${productId}`),
  update: (itemId, action) => api.patch(`/cart/update/${itemId}`, { action }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete("/cart/clear"),
};

// ── Orders ───────────────────────────────────────────────────
export const ordersAPI = {
  checkout: (data) => api.post("/orders/checkout", data),
  myOrders: () => api.get("/orders/my"),
};

// ── Users ────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.patch("/users/profile", data),
  uploadPicture: (form) =>
    api.post("/users/profile/picture", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Wishlist ─────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (id) => api.post(`/wishlist/toggle/${id}`),
};

// ── Admin ────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get("/admin/stats"),
  products: () => api.get("/admin/products"),
  createProduct: (form) =>
    api.post("/admin/products/create", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, form) =>
    api.patch(`/admin/products/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  users: () => api.get("/admin/users"),
  orders: () => api.get("/admin/orders"),
  updateOrderStatus: (userId, orderId, status) =>
    api.patch(`/admin/orders/${userId}/${orderId}/status`, { status }),
  // Seller Management
  getPendingSellers: () => api.get("/admin/sellers/pending"),
  getAllSellers: (params) => api.get("/admin/sellers", { params }),
  approveSeller: (sellerId) => api.patch(`/admin/sellers/${sellerId}/approve`),
  rejectSeller: (sellerId) => api.patch(`/admin/sellers/${sellerId}/reject`),
  suspendSeller: (sellerId) => api.patch(`/admin/sellers/${sellerId}/suspend`),
  getSellerDetails: (sellerId) => api.get(`/admin/sellers/${sellerId}/details`),
};

// ── Sellers ──────────────────────────────────────────────────
export const sellerAPI = {
  register: (data) => api.post("/sellers/register", data),
  getProfile: () => api.get("/sellers/profile"),
  updateProfile: (data) => api.put("/sellers/profile", data),
  getSeller: (sellerId) => api.get(`/sellers/${sellerId}`),
  getSellerProducts: (sellerId, params) =>
    api.get(`/sellers/${sellerId}/products`, { params }),
  getMyProducts: (params) => api.get("/sellers/my/products", { params }),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
