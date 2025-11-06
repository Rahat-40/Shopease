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
    case "CANCELLED": return "badge-error";
    default: return "badge-ghost";
  }
};

const nextStatusMap = { PLACED: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED" };
const validTransitions = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function OrdersSeller() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const params = statusFilter === "ALL" ? {} : { status: [statusFilter] };
        const res = await getSellerOrders(params);
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch seller orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    let list = orders;
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (o) =>
          (o.product?.name || "").toLowerCase().includes(t) ||
          (o.buyerEmail || "").toLowerCase().includes(t)
      );
    }
    return list;
  }, [orders, q]);

  const handleStatusChange = async (id, currentStatus, nextStatus) => {
    if (!validTransitions[currentStatus]?.includes(nextStatus)) return;
    try {
      setUpdatingId(id);
      await updateOrderStatus(id, nextStatus);
      const params = statusFilter === "ALL" ? {} : { status: [statusFilter] };
      const res = await getSellerOrders(params);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="SELLER" />
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Orders Received</h2>
          <div className="flex gap-3">
            <div className="tabs tabs-boxed">
              {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((t) => (
                <button
                  key={t}
                  className={`tab ${statusFilter === t ? "tab-active" : ""}`}
                  onClick={() => setStatusFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="form-control">
              <div className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
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
          <div className="text-center py-10">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-base-content/70">No orders match your filters.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200 sticky top-0 z-10">
                <tr>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-base-300 overflow-hidden flex-shrink-0">
                          {o.product?.imageUrl ? (
                            <img src={o.product.imageUrl} alt={o.product?.name || "Product"} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-base-content/60">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="truncate">{o.product?.name || "Unknown Product"}</div>
                      </div>
                    </td>
                    <td className="truncate">{o.buyerEmail}</td>
                    <td>{o.quantity}</td>
                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                    <td className="text-right">
                      <div className="join">
                        <select
                          className="select select-bordered select-sm join-item"
                          value=""
                          onChange={(e) => handleStatusChange(o.id, o.status, e.target.value)}
                          disabled={updatingId === o.id || !validTransitions[o.status]?.length}
                        >
                          <option value="" disabled>
                            {validTransitions[o.status]?.length ? "Change status" : "No actions"}
                          </option>
                          {validTransitions[o.status]?.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {nextStatusMap[o.status] && (
                          <button
                            className={`btn btn-primary btn-sm join-item ${updatingId === o.id ? "btn-disabled" : ""}`}
                            onClick={() => handleStatusChange(o.id, o.status, nextStatusMap[o.status])}
                            disabled={updatingId === o.id}
                          >
                            {updatingId === o.id ? "Updating..." : "Next"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default OrdersSeller;
