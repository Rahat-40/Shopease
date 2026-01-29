import API from "./api";

// Get all orders of the logged-in buyer (returns OrderPackage[])
export async function getBuyerOrders() {
  return await API.get("/orders/buyer/me");
}

// Get all orders of the logged-in seller (returns Order[])
export async function getSellerOrders(params = {}) {
  return await API.get("/orders/seller/me", { params });
}

// Initiates payment with SSLCommerz. 
export async function initiatePayment(orderPackagePayload) {
  return await API.post("/orders/buyer/initiate", orderPackagePayload);
}

//  Handle Cash on Delivery API call
export async function placeCodOrder(orderPackagePayload) {
  // Calls the new backend endpoint /api/orders/buyer/cod
  return await API.post("/orders/buyer/cod", orderPackagePayload);
}

//  Fetch order details using the transaction ID
export async function fetchOrderPackageByTrxId(transactionId) {
    // Calls the new secure GET endpoint on the backend
    return await API.get(`/orders/buyer/transaction/${transactionId}`);
}

// Cancel an order package (by package id)
export async function cancelBuyerOrder(id) {
  return await API.put(`/orders/buyer/cancel/${id}`);
}

export async function updateOrderStatus(id, status) {
  return await API.put(`/orders/order/${id}/status`, null, { params: { status } });
}