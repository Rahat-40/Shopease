// src/pages/AdminOrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminGetOrder, adminSetOrderStatus } from "../services/admin";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const r = await adminGetOrder(id);
      setOrder(r.data);
    } catch {
      setMsg("Failed to load order.");
    }
  };

  useEffect(()=>{ load(); }, [id]);

  const setStatus = async (s) => {
    try {
      await adminSetOrderStatus(id, s);
      setMsg("Status updated");
      load();
    } catch {
      setMsg("Failed to update status.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-3xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Order #{id}</h1>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">Back</Link>
        </div>
        {msg && <div className="alert alert-info mb-3"><span>{msg}</span></div>}
        {!order ? <div>Loading...</div> : (
          <div className="card bg-base-100 border border-base-200">
            <div className="card-body">
              <div className="mb-2">Buyer: {order.buyerEmail}</div>
              <div className="mb-2">Seller: {order.product?.sellerEmail || order.sellerEmail}</div>
              <div className="mb-2">Status: <span className="badge">{order.status}</span></div>
              <div className="mb-4">Quantity: {order.quantity}</div>
              <div className="mb-4">Product: {order.product?.name} (#{order.product?.id})</div>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-sm" onClick={()=>setStatus("PLACED")}>Placed</button>
                <button className="btn btn-sm" onClick={()=>setStatus("CONFIRMED")}>Confirmed</button>
                <button className="btn btn-sm" onClick={()=>setStatus("SHIPPED")}>Shipped</button>
                <button className="btn btn-sm" onClick={()=>setStatus("DELIVERED")}>Delivered</button>
                <button className="btn btn-sm" onClick={()=>setStatus("CANCELLED")}>Cancelled</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
