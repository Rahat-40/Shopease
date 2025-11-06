import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
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
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skeleton left */}
          <div className="card bg-base-100 border border-base-200 shadow-sm animate-pulse">
            <div className="h-96 w-full bg-base-200" />
          </div>
          {/* Skeleton right */}
          <div className="card bg-base-100 border border-base-200 shadow-sm animate-pulse">
            <div className="card-body">
              <div className="h-8 w-1/2 bg-base-200 rounded mb-4" />
              <div className="h-6 w-1/3 bg-base-200 rounded mb-6" />
              <div className="h-10 w-full bg-base-200 rounded mb-3" />
              <div className="h-10 w-full bg-base-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = Number(product.price || 0).toFixed(2);
  const inStock = product.stock == null ? true : product.stock > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image/Gallery */}
        <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
          <figure className="bg-base-200">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-[28rem] object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-[28rem] flex items-center justify-center text-base-content/60">
                No Image Available
              </div>
            )}
          </figure>
        </div>

        {/* Right: Buy box */}
        <aside className="lg:sticky lg:top-6">
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body space-y-3">
              <h1 className="text-3xl font-semibold">{product.name}</h1>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${price}</span>
                <span className={`badge ${inStock ? "badge-success" : "badge-error"}`}>
                  {inStock ? "In stock" : "Out of stock"}
                </span>
              </div>

              {product.category && (
                <div className="text-sm text-base-content/70">
                  Category: <span className="font-medium">{product.category}</span>
                </div>
              )}

              <p className="text-base-content/80 leading-relaxed">
                {product.description || "No description provided."}
              </p>

              {/* Actions */}
              <div className="pt-2">
                <AddToCartWishlistButtons product={product} />
              </div>

              {/* Trust/help hints */}
              <div className="text-xs text-base-content/60 space-y-1">
                <p>30-day returns on most items.</p>
                <p>Secure checkout. Fast delivery.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Details section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Product details</h2>
              <ul className="list-disc ml-5 space-y-1 text-sm text-base-content/80">
                {product.brand && <li>Brand: {product.brand}</li>}
                {product.sku && <li>SKU: {product.sku}</li>}
                {product.stock != null && <li>Stock: {product.stock}</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* for related items */}

      </div>
    </div>
  );
}

export default ProductDetails;
