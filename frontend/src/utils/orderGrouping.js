// src/utils/orderGrouping.js

/**
 * Transforms a flat list of orders (from the API) into an array of grouped packages.
 * @param {Array} orders - The flat List<Order> entities received from the Spring Boot API.
 * @returns {Array} - An array of package objects, each containing an 'items' array.
 */
export const groupOrdersByTransaction = (orders) => {
  const groups = {};

  orders.forEach((order) => {
    // Use the unique transaction ID from the nested package entity as the key
    const pkg = order.orderPackage; 
    const key = pkg.transactionId;

    if (!groups[key]) {
      // Initialize the package card structure (header data)
      groups[key] = {
        transactionId: key,
        orderPackageId: pkg.id,
        orderDate: pkg.orderDate,
        buyerName: pkg.buyerName,
        buyerEmail: pkg.buyerEmail, // Include buyer email for search/display
        shippingAddress: pkg.shippingAddress,
        shippingCity: pkg.shippingCity,
        paymentStatus: pkg.paymentStatus,
        sellerTotalAmount: 0, 
        items: [] 
      };
    }

    // Add the individual order item and update the running total for this seller
    groups[key].items.push(order);
    groups[key].sellerTotalAmount += (order.unitPrice * order.quantity);
  });

  // Convert the object map into a list and sort by date for rendering
  return Object.values(groups).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
};