import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getSellerOverview } from "../services/sellerService";

function SellerHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSellerOverview();
        if (!mounted) return;
        setStats(res.data || stats);
      } catch {
        setMsg("Failed to load dashboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Active Listings", value: stats.activeListings },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Delivered", value: stats.deliveredOrders },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="SELLER" />

       <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome To Seller Dashboard</h1>
          <p className="mt-2 opacity-90">Add new product and manage your products . Manage your orders.</p>
        </div>
      </div>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        </div>

        {msg && <div className="alert alert-error mb-4"><span>{msg}</span></div>}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((c) => (
            <div key={c.label} className="card bg-white border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
              <div className="card-body">
                <span className="text-sm text-gray-700 font-bold">{c.label}</span>
                <div className="text-3xl font-semibold text-emerald-600">{loading ? "…" : c.value}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/seller/products/new" className="card bg-white border border-gray-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition duration-200">
            <div className="card-body">
              <h3 className="card-title text-emerald-600">Add a new product</h3>
              <p className="text-sm text-gray-600">Create a listing with price, stock, category, and image.</p>
            </div>
          </Link>
          <Link to="/seller/products" className="card bg-white border border-gray-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition duration-200">
            <div className="card-body">
              <h3 className="card-title text-emerald-600">Manage products</h3>
              <p className="text-sm text-gray-600">Edit price/stock, toggle active, or delete items.</p>
            </div>
          </Link>
          <Link to="/seller/orders" className="card bg-white border border-gray-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition duration-200">
            <div className="card-body">
              <h3 className="card-title text-emerald-600">Process orders</h3>
              <p className="text-sm text-gray-600">Advance status: PLACED → CONFIRMED → SHIPPED → DELIVERED.</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SellerHome;
