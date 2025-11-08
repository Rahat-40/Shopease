// src/pages/AdminHome.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminGetStats } from "../services/admin";

function AdminHome() {
  const [stats, setStats] = useState({ users: 0, products: 0, ordersPending: 0, ticketsOpen: 0 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await adminGetStats();
        if (!mounted) return;
        setStats(res.data || { users: 0, products: 0, ordersPending: 0, ticketsOpen: 0 });
      } catch {
        setMsg("Failed to load dashboard stats.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />

       <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome To Admin Dashboard</h1>
          <p className="mt-2 opacity-90">See your users and seller products . Manage users and give support to the users.</p>
        </div>
      </div>

      <main className="flex-grow p-6 w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-emerald-600">Admin Dashboard</h1>
          <p className="opacity-70 text-gray-800">Overview and quick actions</p>
        </div>

        {msg && <div className="alert alert-error mb-4"><span>{msg}</span></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Link
            to="/admin/users"
            className="bg-white border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 rounded-lg p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="text-sm font-bold text-gray-900 mb-2">Users</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? "…" : stats.users}</div>
            <div className="mt-2">
              <span className="text-xs text-emerald-600 font-medium">Manage →</span>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 rounded-lg p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="text-sm font-bold text-gray-900 mb-2">Products</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? "…" : stats.products}</div>
            <div className="mt-2">
              <span className="text-xs text-emerald-600 font-medium">Manage →</span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 rounded-lg p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="text-sm font-bold text-gray-900 mb-2">Pending Orders</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? "…" : stats.ordersPending}</div>
            <div className="mt-2">
              <span className="text-xs text-emerald-600 font-medium">Manage →</span>
            </div>
          </Link>

          <Link
            to="/admin/messages"
            className="bg-white border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 rounded-lg p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="text-sm font-bold text-gray-900 mb-2">Open Messages</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? "…" : stats.ticketsOpen}</div>
            <div className="mt-2">
              <span className="text-xs text-emerald-600 font-medium">Manage →</span>
            </div>
          </Link>
        </div>
        
      </main>
      <Footer />
    </div>
  );
}
export default AdminHome;
