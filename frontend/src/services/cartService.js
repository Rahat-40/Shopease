import API from "./api";

// Get cart items of a buyer by email
export async function getCart(email) {
  return await API.get(`/cart/${email}`);
}

// Add item into cart
export async function addToCart(cartItem) {
  return await API.post("/cart", cartItem);
}

// Remove item from cart
export async function removeFromCart(email, productId) {
  return await API.delete(`/cart/${email}/${productId}`);
}
