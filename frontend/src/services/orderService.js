import API from "./api";


// Get buyer orders by email
export async function getBuyerOrders() {
  return await API.get(`/orders/buyer/me`);
}



// Get seller orders by email
export async function getSellerOrders(params ={}) {
  return await API.get(`/orders/seller/me`,{params});
}


// Place a new order
export async function placeOrder(playload) {
  return await API.post("/orders", playload);
}
// for cancle order
export async function cancelBuyerOrder(id) 
{
  return await API.put(`/orders/${id}/cancel`);
} 
// Update order status
export async function updateOrderStatus(id, status) {
  // Using request body for status update can also be an option
  return await API.put(`/orders/${id}/status`, null, { params: { status } });
} 