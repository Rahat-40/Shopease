import React, { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../services/productService";
import { getProductReviews } from "../services/reviewService";
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
        const data = res.data || [];

        // Fetch reviews using reviewService
        const productsWithRatings = await Promise.all(
          data.map(async (p) => {
            try {
              const revRes = await getProductReviews(p.id);
              const reviews = revRes.data || [];
              const avgRating = reviews.length
                ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
                : 0;
              const totalReviews = reviews.length;
              return { ...p, avgRating, totalReviews };
            } catch {
              return { ...p, avgRating: 0, totalReviews: 0 };
            }
          })
        );

        setProducts(productsWithRatings);
        if (!data.length) setMessage("No products found.");
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
    products.forEach((p) => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "ALL") list = list.filter((p) => p.category === category);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(t));
    }
    if (sort === "PRICE_ASC") list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "PRICE_DESC") list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
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

//  NEW FUNCTION
const renderStars = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    let fillPercent = 0;
    if (i + 1 <= Math.floor(rating)) {
      fillPercent = 100; // Full star
    } else if (i < rating) {
      fillPercent = (rating - i) * 100; // Partial star
    }

    stars.push(
      <div key={i} className="relative inline-block w-4 h-4 mr-0.5">
        {/* Gray Background Star */}
        <svg
          className="w-full h-full text-gray-300 absolute top-0 left-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Yellow Foreground Star (Cropped) */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${fillPercent}%` }}
        >
          <svg
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    );
  }
  return <div className="flex items-center">{stars}</div>;
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role={sessionStorage.getItem("userRole") || ""} />

      <main className="max-w-7xl mx-auto p-6 flex-grow">
        {/* Header + Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-emerald-600">Products</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="form-control w-full sm:w-auto">
              <div className="bg-white border border-emerald-600 input input-bordered flex items-center gap-2 focus-within:ring focus-within:ring-green-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  className="grow outline-none bg-transparent placeholder-emerald-600 text-gray-800"
                  placeholder="Search products"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <select className="select select-bordered w-full sm:w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="select select-bordered w-full sm:w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="RELEVANCE">Sort: Relevance</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : message && !filtered.length ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{message}</p>
            <button className="btn btn-primary hover:bg-green-600 transition" onClick={() => { setQ(""); setCategory("ALL"); setSort("RELEVANCE"); }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => {
              const price = Number(prod.price || 0).toFixed(2);
              const inStock = prod.stock == null ? true : prod.stock > 0;

              return (
                <div key={prod.id} className="card bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden">
                  <Link to={`/products/${prod.id}`}>
                    <figure className="bg-gray-200 h-48">
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 text-gray-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </figure>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${prod.id}`}><h3 className="font-semibold line-clamp-1 text-gray-800">{prod.name}</h3></Link>
                    {prod.category && <p className="text-xs text-gray-500 mt-0.5">{prod.category}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xl font-bold text-red-500">৳ {price}</span>
                      <span className={`badge ${inStock ? "badge-success text-white" : "badge-error text-white"}`}>{inStock ? "In stock" : "Out of stock"}</span>
                    </div>
                    <div className="flex items-center mt-1 gap-2">{renderStars(prod.avgRating)}
                    <span className="text-sm font-bold text-red-500">
                        {prod.avgRating > 0 ? prod.avgRating.toFixed(1) : "0.0"}
                      </span>                      
                    <span className="text-xs text-gray-500">({prod.totalReviews})</span></div>
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
