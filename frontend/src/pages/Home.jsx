import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function ProductCard({ p, onRequireAuth }) {

  const token = sessionStorage.getItem("token");
  const add = () => (!token ? onRequireAuth() : console.log("add-to-cart", p.id));
  return (
     <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-300">
      <figure className="h-48 bg-gray-300 overflow-hidden">
        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>}
      </figure>
      <div className="card-body">
        <h3 className="card-title text-base-300">{p.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-red-400">৳{Number(p.price || 0).toFixed(2)}</span>
          <span className={`badge ${p.active ? "badge-success" : "badge-ghost"}`}>{p.active ? "Available" : "Inactive"}</span>
        </div>
        <div className="card-actions justify-between mt-2">
          <Link className="btn  btn-sm bg-emerald-600 border-emerald-600 hover:bg-white hover:text-emerald-600" to={`/products/${p.id}`}>Details</Link>
          <div className="join">
            <button className="btn  btn-sm join-item bg-white border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white" onClick={add}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const onRequireAuth = () => { navigate("/login"); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await API.get("/products"); // public GET allowed
        setItems(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Welcome to ShopEase</h1>
          <p className="mt-2 opacity-90">Browse products freely. Sign in to add to cart or buy.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn bg-white text-emerald-600 border border-white hover:bg-emerald-600 hover:text-white" onClick={() => navigate("/register")}>Get Started</button>
            <button className="btn bg-transparent border border-white hover:bg-white hover:text-emerald-600" onClick={() => navigate("/products")}>Explore Products</button>
          </div>
        </div>
      </div>
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} p={p} onRequireAuth={onRequireAuth} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
