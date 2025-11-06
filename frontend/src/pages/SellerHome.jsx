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
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="SELLER" />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-semibold">Seller Dashboard</h2>
        </div>

        {msg && <div className="alert alert-error mb-4"><span>{msg}</span></div>}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((c) => (
            <div key={c.label} className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body">
                <span className="text-sm text-base-content/70">{c.label}</span>
                <div className="text-3xl font-semibold">{loading ? "…" : c.value}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/seller/products/new" className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition">
            <div className="card-body">
              <h3 className="card-title">Add a new product</h3>
              <p className="text-sm text-base-content/70">Create a listing with price, stock, category, and image.</p>
            </div>
          </Link>
          <Link to="/seller/products" className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition">
            <div className="card-body">
              <h3 className="card-title">Manage products</h3>
              <p className="text-sm text-base-content/70">Edit price/stock, toggle active, or delete items.</p>
            </div>
          </Link>
          <Link to="/seller/orders" className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition">
            <div className="card-body">
              <h3 className="card-title">Process orders</h3>
              <p className="text-sm text-base-content/70">Advance status: PLACED → CONFIRMED → SHIPPED → DELIVERED.</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SellerHome;
