import React, { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../services/productService";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";
import { Link } from "react-router-dom";

function BuyerProducts() {
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
    <div className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm animate-pulse overflow-hidden">
      <div className="h-48 bg-base-200" />
      <div className="p-4">
        <div className="h-5 w-2/3 bg-base-200 rounded mb-3" />
        <div className="h-6 w-1/3 bg-base-200 rounded mb-4" />
        <div className="h-10 w-full bg-base-200 rounded" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header + controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="form-control">
            <div className="input input-bordered flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Search products"
                value={q}
                onChange={(e)=> setQ(e.target.value)}
              />
            </div>
          </div>
          <select
            className="select select-bordered"
            value={category}
            onChange={(e)=> setCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="select select-bordered"
            value={sort}
            onChange={(e)=> setSort(e.target.value)}
          >
            <option value="RELEVANCE">Sort: Relevance</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("Failed") ? "alert-error" : "alert-info"} mb-4`}>
          <span>{message}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base-content/70 mb-4">No products match your filters.</p>
          <button className="btn btn-primary" onClick={()=> { setQ(""); setCategory("ALL"); setSort("RELEVANCE"); }}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(prod => {
            const price = Number(prod.price || 0).toFixed(2);
            return (
              <div key={prod.id} className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                <Link to={`/products/${prod.id}`}>
                  <figure className="bg-base-200 h-48">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base-content/60 text-sm">
                        No Image
                      </div>
                    )}
                  </figure>
                </Link>
                
                <div className="p-4">
                  <Link to={`/products/${prod.id}`}>
                    <h3 className="font-semibold line-clamp-1">{prod.name}</h3>
                  </Link>

                  {prod.category && (
                    <p className="text-xs text-base-content/60 mt-0.5">{prod.category}</p>
                  )}

                  {/* Price + stock badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-xl font-bold">${price}</div>
                    {(() => {
                      const inStock = prod.stock == null ? true : prod.stock > 0;
                      const badgeClass = inStock ? "badge-success" : "badge-error";
                      return (
                        <span className={`badge ${badgeClass}`}>
                          {inStock ? "In stock" : "Out of stock"}
                        </span>
                      );
                    })()}
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
    </div>
  );
}

export default BuyerProducts;
