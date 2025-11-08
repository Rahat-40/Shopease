// src/pages/AdminOrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminGetOrder, adminSetOrderStatus } from "../services/admin";
import dayjs from "dayjs";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-3xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-emerald-600">Order #{id}</h1>
          <Link to="/admin/orders" className="btn btn-sm bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white">Back</Link>
        </div>
        {msg && <div className="alert alert-info mb-3"><span>{msg}</span></div>}
        {!order ? <div>Loading...</div> : (
          <div className="card bg-white border border-gray-200 shadow-2xl">
            <div className="card-body">
              <div className="mb-2 text-gray-900 font-semibold">Buyer: {order.buyerEmail}</div>
              <div className="mb-2 text-gray-900 font-semibold">Seller: {order.product?.sellerEmail || order.sellerEmail}</div>
              <div className="mb-2 text-gray-900 font-semibold">Status: <span className={`badge ${statusColor(order.status)}`}>{order.status}</span></div>
              <div className="mb-4 text-gray-900 font-semibold">Quantity: {order.quantity}</div>
              <div className="mb-4 text-gray-900 font-semibold">Product: {order.product?.name} (#{order.product?.id})</div>
              <div className="mb-4 text-red-600 font-semibold">Ordered on: {order.orderDate ? dayjs(order.orderDate).format("DD MMM YYYY, hh:mm A") : "-"} </div>
            
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
