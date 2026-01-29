// src/services/admin.js
import API from "./api";

// USERS
export const adminListUsers = (q = "") =>
  API.get(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);

export const adminSetUserRole = (id, role) =>
  API.put(`/admin/users/${id}/role?role=${encodeURIComponent(role)}`);

export const adminDeleteUser = (id) =>
  API.delete(`/admin/users/${id}`);

// PRODUCTS
export const adminListProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return API.get(`/admin/products${qs ? `?${qs}` : ""}`);
};

export const adminUpdateProduct = (id, payload) =>
  API.put(`/admin/products/${id}`, payload);

export const adminToggleProductActive = (id, active) =>
  API.put(`/admin/products/${id}/active?active=${active}`);

export const adminDeleteProduct = (id) =>
  API.delete(`/admin/products/${id}`);

// ORDERS (Packages)
export const adminListOrders = (status = "") =>
  API.get(`/admin/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`);

export const adminGetOrder = (packageId) =>
  API.get(`/admin/orders/${packageId}`);

export const adminSetOrderStatus = (orderId, status) =>
  API.put(`/admin/orders/${orderId}/status?status=${encodeURIComponent(status)}`);

export const adminSetPackageStatus = (packageId, status) =>
  API.put(`/admin/orders/package/${packageId}/status?status=${encodeURIComponent(status)}`);


// STATS (for AdminHome KPIs)
export const adminGetStats = () =>
  API.get(`/admin/stats`);
