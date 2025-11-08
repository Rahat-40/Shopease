import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";
import { getProductById } from "../services/productService";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.data);
        setError("");
      } catch {
        setError("Product not found.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar role={localStorage.getItem("userRole") || ""} />
        <div className="max-w-6xl mx-auto p-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 w-full bg-gray-200 rounded shadow-sm" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-6 w-1/2 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar role={localStorage.getItem("userRole") || ""} />
        <div className="max-w-3xl mx-auto p-6">
          <div className="alert alert-error">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const price = Number(product.price || 0).toFixed(2);
  const inStock = product.stock == null ? true : product.stock > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={localStorage.getItem("userRole") || ""} />
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="btn bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white btn-sm mb-6"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow overflow-hidden">
            <figure className="bg-gray-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-[28rem] object-cover transition-transform duration-300 text-gray-600 hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[28rem] flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </figure>
          </div>

          {/* Right: Buy Box */}
          <aside className="lg:sticky lg:top-6">
            <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="card-body space-y-3">
                <h1 className="text-3xl font-bold text-emerald-700">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">৳{price}</span>
                  <span className={`badge ${inStock ? "badge-success" : "badge-error"}`}>
                    {inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>

                {product.category && (
                  <div className="text-sm text-gray-600">
                    Category: <span className="font-medium">{product.category}</span>
                  </div>
                )}

                <p className="text-gray-700 leading-relaxed">
                  {product.description || "No description provided."}
                </p>

                <AddToCartWishlistButtons product={product} size="sm" layout="row" />

                <div className="text-xs text-gray-500 space-y-1">
                  <p>30-day returns on most items.</p>
                  <p>Secure checkout. Fast delivery.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Product Details Section */}
        <div className="mt-10">
          <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-emerald-600">Product Details</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                {product.brand && <li>Brand: {product.brand}</li>}
                {product.sku && <li>SKU: {product.sku}</li>}
                {product.stock != null && <li>Stock: {product.stock}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
