// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminListOrders } from "../services/admin";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

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
  const load = async () => {
    setLoading(true);
    try {
      const r = await adminListOrders(status);
      setItems(r.data || []);
    } catch {
      setMsg("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-emerald-600">Orders</h1>
          <div className="flex gap-2">
            <select className="select select-bordered" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">All</option>
              <option>PLACED</option>
              <option>CONFIRMED</option>
              <option>SHIPPED</option>
              <option>DELIVERED</option>
              <option>CANCELLED</option>
            </select>
            <button className="btn" onClick={load}>Filter</button>
          </div>
        </div>
        {msg && <div className="alert alert-error mb-3"><span>{msg}</span></div>}
        <div className="card bg-gray-200 border border-gray-200 shadow-2xl">
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
            {loading ? <div>Loading...</div> : (
              <table className="table w-full">
                <thead className="bg-emerald-600 sticky top-0 z-10"><tr className="text-white font-semibold"><th>ID</th><th>Buyer</th><th>Seller</th><th>Status</th><th>Created</th><th> Action</th></tr></thead>
                <tbody>
                  {items.map((o,i)=>(
                    <tr key={o.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-200"}>
                      <td className="text-gray-900">{o.id}</td>
                      <td className="text-gray-900">{o.buyerEmail}</td>
                      <td className="text-gray-900">{o.product?.sellerEmail || o.sellerEmail}</td>
                      <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                      <td className="text-gray-900">{o.orderDate ? dayjs(o.orderDate).format("DD MMM YYYY, hh:mm A") : "-"}</td>

                      <td><Link className="btn btn-sm bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white" to={`/admin/orders/${o.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
