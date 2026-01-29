import React, { useEffect, useState, useMemo } from "react";
import { getBuyerOrders, cancelBuyerOrder } from "../services/orderService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import dayjs from "dayjs";

/* Status Badge Colors */
const statusColor = (status) => {
switch (status) {
case "DELIVERED": return "badge-success";
case "SHIPPED": return "badge-info";
case "CONFIRMED": return "badge-warning";
case "PLACED": return "badge-neutral";
case "CANCELLED": return "badge-error";
default: return "badge-neutral";
}
};

/* Steps for Tracking */
const stepsFor = (status) => {
const steps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
const idx = Math.max(0, steps.indexOf(status));
return { steps, idx };
};

function OrdersBuyer() {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [filter, setFilter] = useState("ALL");
const [q, setQ] = useState("");

// Fetch orders from backend
const fetchOrders = async () => {
setLoading(true);
try {
const res = await getBuyerOrders();
const arr = Array.isArray(res.data) ? res.data : [];
setOrders(arr);
if (arr.length === 0) setMessage("You have no orders yet.");
} catch {
setMessage("Failed to load orders.");
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchOrders();
}, []);

const filtered = useMemo(() => {
  let list = orders;

  if (filter !== "ALL") {
    //  filter by package status
    list = list.filter(pkg => pkg.status === filter);
  }

  if (q.trim()) {
    const t = q.toLowerCase();
    // still filter by product name inside package items
    list = list.filter(pkg => 
      (pkg.orders || []).some(o => (o.product?.name || "").toLowerCase().includes(t))
    );
  }

  return list;
}, [orders, filter, q]);


// Cancel order package
const handleCancel = async (pkgId) => {
try {
await cancelBuyerOrder(pkgId);
fetchOrders(); // refresh after cancel
} catch {
setMessage("Failed to cancel order.");
}
};

if (loading) return <p className="text-center mt-6 text-lg">Loading orders...</p>;

return ( <div className="flex flex-col min-h-screen bg-gray-50"> <Navbar role="BUYER" /> <main className="flex-grow p-6 max-w-6xl mx-auto">
{/* Header */} <div className="relative mb-6 flex justify-between items-center"> <h2 className="text-3xl font-semibold text-emerald-600">My Orders</h2> <button
         className="btn btn-sm btn-outline btn-info"
         onClick={fetchOrders}
       >
Refresh </button> </div>

    {/* Message */}
    {message && <div className={`alert ${message.includes("Failed") ? "alert-error" : "alert-info"} mb-4`}>
      <span>{message}</span>
    </div>}

    {/* Filters */}
    <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="tabs tabs-boxed bg-gray-500">
        {["ALL","PLACED","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"].map(t => (
          <button
            key={t}
            className={`tab transition-colors duration-200 ${filter === t ? "bg-emerald-600 !text-white font-semibold shadow-md" : "!text-white hover:bg-emerald-200 hover:!text-gray-800"}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="form-control">
        <input
          type="text"
          className="input input-bordered"
          placeholder="Search by product"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
    </div>

    {/* Orders List */}
    {filtered.length === 0 ? (
      <div className="text-center py-16">
        <p className="text-base-content/70 mb-4">No orders match your filters.</p>
      </div>
    ) : (
      <ul className="space-y-4">
        {filtered.map(pkg => {
          const pkgStatus = pkg.status; // always use backend package status
          const { steps, idx } = stepsFor(pkgStatus);

          return (
            <li key={pkg.id} className="card bg-white border rounded-xl shadow-md hover:shadow-2xl transition-all">
              <div className="card-body p-4 sm:p-5">
                    {/* --- Order Header --- */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">Order Id #{pkg.id}</h3>
                        <p className="text-sm text-gray-500">
                          Placed on {dayjs(pkg.createdAt || pkg.order_date).format("DD MMM YYYY, hh:mm A")}
                        </p>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-gray-800">TOTAL AMOUNT</span>
                         <p className="text-xl font-bold text-emerald-600">৳{pkg.total_amount || pkg.totalAmount || 0}</p>
                      </div>
                      
                    </div>

                    {/* --- NEW SECTION: Shipping & Payment Details --- */}
                    <div className="mt-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        
                        {/* Column 1: Shipping Info */}
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Shipping Details</h4>
                          <p className="text-gray-600">
                            <span className="font-semibold">Receiver:</span> {pkg.buyer_name || pkg.buyerName}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Phone:</span> {pkg.buyer_phone || pkg.buyerPhone}
                          </p>
                          <p className="text-gray-600 mt-1">
                            {pkg.shipping_address || pkg.shippingAddress}, <br />
                            {pkg.shipping_city || pkg.shippingCity} - {pkg.shipping_postcode || pkg.shippingPostcode}
                          </p>
                        </div>

                        {/* Column 2: Payment Info */}
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Payment Info</h4>
                          <p className="text-gray-600">
                            <span className="font-semibold">Method:</span> {pkg.payment_method || pkg.paymentMethod || "N/A"}
                          </p>
                          <p className="text-gray-600">
                             <span className="font-semibold">Status:</span> 
                             <span className={`ml-2 badge badge-sm ${pkg.payment_status === 'PAID' ? 'badge-success' : 'badge-ghost'}`}>
                               {pkg.payment_status || pkg.paymentStatus}
                             </span>
                          </p>
                          <p className="text-gray-600 mt-1 truncate">
                            <span className="font-semibold">Trx ID:</span> 
                            <span className="font-mono text-xs ml-1 bg-gray-200 px-1 rounded">
                              {pkg.transaction_id || pkg.transactionId || "N/A"}
                            </span>
                          </p>
                        </div>

                      </div>
                    </div>
                    {/* --- END NEW SECTION --- */}

                {/* Package tracking steps */}
                <ul className="steps steps-horizontal sm:steps mb-4">
                  {steps.map((s,i) => (
                    <li key={s} className={`step ${i <= idx ? "step-success" : ""}`}>
                      <span className="hidden sm:inline text-emerald-600">{s}</span>
                      <span className="sm:hidden">{i+1}</span>
                    </li>
                  ))}
                </ul>

                {/* Items */}
                <ul className="space-y-2">
                  {(pkg.orders || []).map(order => {
                    const unit = Number(order.product?.price || 0);
                    const total = (unit * Number(order.quantity || 0)).toFixed(2);

                    return (
                      <li key={order.id} className="border rounded p-2 sm:p-3 flex flex-col sm:flex-row gap-4 items-start bg-gray-50">
                        <div className="w-24 h-24 bg-gray-300 flex-shrink-0 overflow-hidden rounded">
                          {order.product?.imageUrl ? <img src={order.product.imageUrl} alt={order.product?.name || "Product"} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-gray-800 text-sm">No Image</div>}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold line-clamp-1 text-gray-800">{order.product?.name || "Unknown Product"}</h4>
                          </div>
                          <div className="flex gap-4 text-sm mt-1 flex-wrap text-gray-800">
                            <span>Qty: <span className="font-medium">{order.quantity}</span></span>
                            <span>Unit: <span className="font-medium text-red-600">৳{unit.toFixed(2)}</span></span>
                          </div>
                          <span className="text-gray-800">Total: <span className="font-semibold text-emerald-600">৳{total}</span></span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Cancel package button */}
                {(pkg.orders || []).some(o => ["PLACED","CONFIRMED"].includes(o.status)) && (
                  <div className="mt-3">
                    <button
                      className="btn bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white btn-sm"
                      onClick={() => handleCancel(pkg.id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </main>
  <Footer />
</div>

);
}

export default OrdersBuyer;
