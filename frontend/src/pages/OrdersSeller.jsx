import React, { useEffect, useMemo, useState } from "react";
import { getSellerOrders, updateOrderStatus } from "../services/orderService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const statusColor = (status) => {
  switch (status) {
    case "DELIVERED": return "badge-success";
    case "SHIPPED": return "badge-info";
    case "CONFIRMED": return "badge-warning";
    case "PLACED": return "badge-neutral";
    case "CANCELLED":
    case "FAILED": return "badge-error";
    default: return "badge-ghost";
  }
};

// Simplified map for package status transitions
const packageNextStatusMap = { 
    PLACED: "CONFIRMED", 
    CONFIRMED: "SHIPPED", 
    SHIPPED: "DELIVERED" 
};

function OrdersSeller() {
  const [orderPackages, setOrderPackages] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  // updatingId now tracks the ID of the PACKAGE being updated
  const [updatingId, setUpdatingId] = useState(null); 

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getSellerOrders({});
      setOrderPackages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch seller orders:", err);
      setOrderPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredPackages = useMemo(() => {
    let list = orderPackages; 

    if (statusFilter !== "ALL") {
      list = list.filter((op) => op.status === statusFilter);
    }
    
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((op) =>
        (op.buyerEmail || "").toLowerCase().includes(t) || 
        op.orders.some((o) => 
            (o.product?.name || "").toLowerCase().includes(t)
        )
      );
    }
    return list;
  }, [orderPackages, q, statusFilter]);

  // NEW FUNCTION: Handles status change for ALL seller items within a package
  const handlePackageStatusChange = async (pkg, nextStatus) => {
    // Find the IDs of all orders belonging to this seller in the package
    const orderIds = pkg.orders.map(o => o.id);
    
    if (orderIds.length === 0) return;

    // Check if the package is already marked as delivered/cancelled/failed
    if (["DELIVERED", "CANCELLED", "FAILED"].includes(pkg.status) && nextStatus !== "CANCELLED") {
        console.warn(`Package ${pkg.id} is already finalized.`);
        return;
    }

    try {
      // Set the updating ID to the PACKAGE ID
      setUpdatingId(pkg.id); 

      // Loop through all order IDs and update their status sequentially
      for (const orderId of orderIds) {
        // The backend OrderService handles the individual item validation
        await updateOrderStatus(orderId, nextStatus);
      }
      
      // Fetch all orders again to get the updated item statuses 
      // and the recalculated package status from the backend
      await fetchOrders(); 
    } catch (err) {
      console.error(`Failed to update package ${pkg.id} orders:`, err);
    } finally {
      setUpdatingId(null);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="SELLER" />
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-emerald-600">Orders Received</h2>
          <div className="flex gap-3">
            <div className="tabs tabs-boxed bg-gray-300">
              {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((t) => (
                <button
                  key={t}
                  className={`tab transition-colors duration-200 ${
                    statusFilter === t
                      ? "bg-emerald-600 !text-white font-semibold shadow-md"
                      : "!text-gray-800 hover:bg-emerald-200 hover:text-gray-900"
                  }`}
                  onClick={() => setStatusFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="form-control">
              <div className="input text-emerald-600 input-bordered flex items-center gap-2 border-emerald-600 bg-white">
                <input
                  type="text"
                  className="grow"
                  placeholder="Search product or buyer"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading orders...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No orders found matching your criteria.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`bg-white p-6 border rounded-lg shadow-xl transition-shadow duration-300 
                  ${updatingId === pkg.id ? 'border-amber-500 shadow-amber-300 animate-pulse' : 'border-emerald-300 hover:shadow-2xl'}`}
              >
                
                {/* === Package Header === */}
                <div className="pb-4 border-b border-gray-200 mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-700">Order Package #{pkg.id}</h3>
                    <p className="text-sm text-gray-500">Transaction ID: {pkg.transactionId}</p>

                        {/* --- ADDED PAYMENT INFO --- */}
                        <div className="flex gap-4 mt-1 text-sm">
                            <span className="font-semibold text-gray-700">Payment: <span className="text-gray-900 font-bold">{pkg.paymentMethod || 'N/A'}</span></span>
                            <span className="font-semibold text-gray-700">Status: <span className={`font-bold ${pkg.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>{pkg.paymentStatus || 'PENDING'}</span></span>
                        </div>

                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Shipping Information:</p>
                            
                            <div className="flex flex-wrap items-start gap-x-6 gap-y-1 text-sm">
                                
                                {/* Buyer Name & Contact */}
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-600">👤 Recipient:</span>
                                    <span className="text-gray-800">{pkg.buyerName || 'N/A'}</span>
                                    <span className="text-gray-500 ml-2">({pkg.buyerPhone || pkg.buyerEmail})</span>
                                </div>

                                {/* Address */}
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-600">📍 Address:</span>
                                    <span className="text-gray-800">
                                        {pkg.shippingAddress}, {pkg.shippingCity}, {pkg.shippingPostcode}
                                    </span>
                                </div>
                                
                            </div>
                        </div>
                        
                  </div>
                  <div className="text-right">
                    <span className={`badge text-lg px-4 py-3 font-semibold ${statusColor(pkg.status)}`}>
                      {pkg.status}
                    </span>
                    <p className="text-xl font-extrabold text-red-600 mt-2">
                      Total: ৳{pkg.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

               
                <div className="mb-4 flex gap-4 justify-end">
                  <div className="join">
               
                    {pkg.status === 'PLACED' || pkg.status === 'CONFIRMED' ? (
                      <button 
                        className={`btn btn-sm btn-error text-white ${updatingId === pkg.id ? "btn-disabled" : ""}`}
                        onClick={() => handlePackageStatusChange(pkg, "CANCELLED")}
                        disabled={updatingId === pkg.id}
                      >
                        {updatingId === pkg.id ? "Updating..." : "Cancel"}
                      </button>
                    ) : null}

                    {/* Next Status Button */}
                    {packageNextStatusMap[pkg.status] && (
                      <button
                        className={`btn btn-sm border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-600 hover:text-white ${
                          updatingId === pkg.id ? "btn-disabled" : ""
                        }`}
                        onClick={() =>
                          handlePackageStatusChange(pkg, packageNextStatusMap[pkg.status])
                        }
                        disabled={updatingId === pkg.id}
                      >
                        {updatingId === pkg.id ? "Updating..." : `Move All to ${packageNextStatusMap[pkg.status]}`}
                      </button>
                    )}
                    {updatingId === pkg.id && (
                        <span className="btn btn-sm btn-ghost loading"></span>
                    )}
                  </div>
                </div>

                
               
                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-dashed pb-2">Items in This Package (Your Products)</h4>
                
                <div className="divide-y divide-gray-100">
                  {pkg.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-3 gap-4">
                      
                      {/* Item Details */}
                      <div className="flex-grow flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded bg-gray-600 overflow-hidden flex-shrink-0">
                          {o.product?.imageUrl ? (
                            <img src={o.product.imageUrl} className="w-full h-full object-cover" alt={o.product?.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <div className="font-medium text-gray-800 truncate">{o.product?.name || "Unknown Product"}</div>
                          <div className="flex gap-4 text-sm text-gray-800">Qty: {o.quantity} <span className="text-red-700 font-semibold">Price: ৳{o.unitPrice.toFixed(2)}</span></div>
                        </div>
                      </div>
                      
                      
                      <div className="flex items-center gap-4 flex-shrink-0">

                        <p className="text-emerald-700 font-bold">Total: ৳{(Number(o.unitPrice || 0) * Number(o.quantity || 0)).toFixed(2)}</p>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default OrdersSeller;