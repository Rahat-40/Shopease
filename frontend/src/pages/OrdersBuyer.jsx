import React, { useEffect, useState, useMemo } from "react";
import { getBuyerOrders, cancelBuyerOrder } from "../services/orderService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import dayjs from "dayjs";

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

  useEffect(() => {
    async function fetchOrders() {
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
    }
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "ALL") list = list.filter((o) => o.status === filter);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((o) => (o.product?.name || "").toLowerCase().includes(t));
    }
    return list;
  }, [orders, filter, q]);

  const canCancel = (s) => s === "PLACED" || s === "CONFIRMED";
  const handleCancel = async (id) => {
    try {
      await cancelBuyerOrder(id);
      const res = await getBuyerOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessage("Failed to cancel order.");
    }
  };

  if (loading) return <p className="text-center mt-6 text-lg">Loading orders...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="BUYER" />
      <main className="flex-grow p-6 max-w-6xl mx-auto">
        <div className="relative mb-6">
          <div className="flex justify-center">
            <h2 className="text-3xl font-semibold text-emerald-600">My Orders</h2>
          </div>
          {orders.length > 0 && (
            <div className="absolute inset-y-0 right-0 hidden sm:flex items-center">
              <span className="badge badge-neutral">
                {orders.length} order{orders.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes("Failed") ? "alert-error" : "alert-info"} mb-4`}>
            <span>{message}</span>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed bg-gray-500">
            {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((t) => (
              <button key={t} className={`tab transition-colors duration-200 ${filter === t ? "bg-emerald-600 !text-white font-semibold shadow-md" : "!text-white hover:bg-emerald-200 hover:!text-gray-800"}`} onClick={() => setFilter(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="form-control">
            <div className="input input-bordered flex items-center gap-2 bg-white border-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-60 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input type="text" className="grow text-emerald-800 font-semibold" placeholder="Search by product" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base-content/70 mb-4">No orders match your filters.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((order) => {
              const unit = Number(order.product?.price || 0);
              const total = (unit * Number(order.quantity || 0)).toFixed(2);
              const when = dayjs(order.orderDate).format("DD MMM YYYY, hh:mm A");
              const { steps, idx } = stepsFor(order.status || "PLACED");

              return (
                <li key={order.id} className="card bg-white border border-gray-200 rounded-xl shadow-md 
                 hover:shadow-2xl hover:border-gray-100 hover:-translate-y-1 
                 transition-all duration-300 ease-out">
                  <div className="card-body p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-24 h-24 flex-shrink-0 rounded bg-gray-300 overflow-hidden">
                        {order.product?.imageUrl ? (
                          <img src={order.product.imageUrl} alt={order.product?.name || "Product"} className="w-full h-full object-cover text-gray-800" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-800 text-sm">No Image</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1 text-gray-800">{order.product?.name || "Unknown Product"}</h3>
                            <p className="text-sm text-gray-600">Ordered on {when}</p>
                          </div>
                          <span className={`badge ${statusColor(order.status)}`}>{order.status}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-gray-800">Qty: <span className="font-medium text-gray-800">{order.quantity}</span></span>
                          <span className="text-gray-800">Unit: <span className="font-medium text-red-600">৳{unit.toFixed(2)}</span></span>
                          <span className="font-semibold text-emerald-600">Total: ৳{total}</span>
                        </div>

                        <div className="mt-3">
                          <ul className="steps steps-horizontal sm:steps">
                            {steps.map((s, i) => (
                              <li key={s} className={`step ${i <= idx ? "step-success" : ""}`}>
                                <span className="hidden sm:inline">{s}</span>
                                <span className="sm:hidden">{i + 1}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {["PLACED","CONFIRMED"].includes(order.status) && (
                          <div className="mt-3">
                            <button className="btn bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white btn-sm" onClick={() => handleCancel(order.id)}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
