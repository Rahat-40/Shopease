import API from "./api";

export const getAllProducts = (params = {}) => API.get("/products", { params });
export const getProductById = (id) => API.get(`/products/${id}`);

export const getMySellerProducts = (params = {}) => API.get("/products/seller/me", { params });

export const addProduct = (data) => {
  if (data instanceof FormData) return API.post("/products", data);
  return API.post("/products", data);
};
export const updateProduct = (id, data) => {
  if (data instanceof FormData) return API.put(`/products/${id}`, data);
  return API.put(`/products/${id}`, data);
};
export const deleteProduct = (id) => API.delete(`/products/${id}`);
