import API from "./api";

export const getProductReviews = (productId) => API.get(`/reviews/${productId}`);
export const addProductReview = (productId, data) => API.post(`/reviews/${productId}`, data);
// data = { rating: number, comment: string }
