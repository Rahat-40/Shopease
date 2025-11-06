import API from "./api";

// Get all wishlist items of a buyer
export async function getWishlist(email) {
  return await API.get(`/wishlist/${email}`);
}

// Add item to wishlist
export async function addToWishlist(item) {
  return await API.post("/wishlist", item);
}

// Remove item from wishlist
export async function removeFromWishlist(email, productId) {
  return await API.delete(`/wishlist/${email}/${productId}`);
}
