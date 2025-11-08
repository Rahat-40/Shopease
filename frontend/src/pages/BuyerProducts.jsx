import React, { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../services/productService";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BuyerProducts() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("RELEVANCE");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getAllProducts();
        setProducts(res.data || []);
        if (!res.data || res.data.length === 0) setMessage("No products found.");
      } catch {
        setMessage("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "ALL") list = list.filter(p => p.category === category);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(p => (p.name || "").toLowerCase().includes(t));
    }
    if (sort === "PRICE_ASC") list = [...list].sort((a,b)=> Number(a.price||0)-Number(b.price||0));
    if (sort === "PRICE_DESC") list = [...list].sort((a,b)=> Number(b.price||0)-Number(a.price||0));
    return list;
  }, [products, q, category, sort]);

  const SkeletonCard = () => (
    <div className="card bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role={sessionStorage.getItem("userRole") || ""} />

      <main className="max-w-7xl mx-auto p-6 flex-grow">
        {/* Header + Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-emerald-600">Products</h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="form-control w-full sm:w-auto">
              <div className="bg-white border border-emerald-600 input input-bordered flex items-center gap-2 focus-within:ring focus-within:ring-green-400 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  className="grow outline-none bg-transparent placeholder-emerald-600 text-gray-800"
                  placeholder="Search products"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <select
              className="select select-bordered w-full sm:w-auto"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="select select-bordered w-full sm:w-auto"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="RELEVANCE">Sort: Relevance</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : message && !filtered.length ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{message}</p>
            <button
              className="btn btn-primary hover:bg-green-600 transition"
              onClick={() => { setQ(""); setCategory("ALL"); setSort("RELEVANCE"); }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(prod => {
              const price = Number(prod.price || 0).toFixed(2);
              const inStock = prod.stock == null ? true : prod.stock > 0;

              return (
                <div
                  key={prod.id}
                  className="card bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                >
                  <Link to={`/products/${prod.id}`}>
                    <figure className="bg-gray-200 h-48">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 text-gray-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </figure>
                  </Link>

                  <div className="p-4">
                    <Link to={`/products/${prod.id}`}>
                      <h3 className="font-semibold line-clamp-1 text-gray-800">{prod.name}</h3>
                    </Link>

                    {prod.category && (
                      <p className="text-xs text-gray-500 mt-0.5">{prod.category}</p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xl font-bold text-red-500">৳ {price}</span>
                      <span className={`badge ${inStock ? "badge-success" : "badge-error"}`}>
                        {inStock ? "In stock" : "Out of stock"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <AddToCartWishlistButtons product={prod} size="sm" layout="row" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
