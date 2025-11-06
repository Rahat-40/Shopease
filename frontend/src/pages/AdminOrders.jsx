// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminListOrders } from "../services/admin";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

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
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Orders</h1>
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
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body overflow-x-auto">
            {loading ? <div>Loading...</div> : (
              <table className="table table-zebra">
                <thead><tr><th>ID</th><th>Buyer</th><th>Seller</th><th>Status</th><th>Created</th><th></th></tr></thead>
                <tbody>
                  {items.map(o=>(
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.buyerEmail}</td>
                      <td>{o.product?.sellerEmail || o.sellerEmail}</td>
                      <td><span className="badge">{o.status}</span></td>
                      <td>{o.orderDate?.replace("T"," ").split(".")[0]}</td>
                      <td><Link className="btn btn-sm" to={`/admin/orders/${o.id}`}>View</Link></td>
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
