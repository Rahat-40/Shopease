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
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="ADMIN" />
      <main className="flex-grow p-6 w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="opacity-70">Overview and quick actions</p>
        </div>

        {msg && <div className="alert alert-error mb-4"><span>{msg}</span></div>}

        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 mb-6">
          <div className="stat">
            <div className="stat-title">Users</div>
            <div className="stat-value">{loading ? "…" : stats.users}</div>
            <div className="stat-actions"><Link className="btn btn-ghost btn-xs mt-2" to="/admin/users">Manage</Link></div>
          </div>
          <div className="stat">
            <div className="stat-title">Products</div>
            <div className="stat-value">{loading ? "…" : stats.products}</div>
            <div className="stat-actions"><Link className="btn btn-ghost btn-xs mt-2" to="/admin/products">Manage</Link></div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-value">{loading ? "…" : stats.ordersPending}</div>
            <div className="stat-actions"><Link className="btn btn-ghost btn-xs mt-2" to="/admin/orders">Manage</Link></div>
          </div>
          <div className="stat">
            <div className="stat-title">Open Tickets</div>
            <div className="stat-value">{loading ? "…" : stats.ticketsOpen}</div>
            <div className="stat-actions"><Link className="btn btn-ghost btn-xs mt-2" to="/admin/messages">Manage</Link></div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 mb-6">
          <div className="card-body">
            <h2 className="card-title">Quick actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link className="btn btn-primary" to="/admin/users">Users</Link>
              <Link className="btn btn-secondary" to="/admin/products">Products</Link>
              <Link className="btn btn-warning" to="/admin/orders">Orders</Link>
              <Link className="btn btn-error" to="/admin/messages">Support</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default AdminHome;
