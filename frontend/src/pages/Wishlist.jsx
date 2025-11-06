import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Wishlist() {
 
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState(null); // for inline remove confirm

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    async function fetchWishlist() {
      try {
        const res = await getWishlist(email);
        const mergedMap = new Map();
        res.data.forEach((item) => {
          const id = item.product.id;
          if (!mergedMap.has(id)) mergedMap.set(id, { ...item });
        });
        const mergedItems = Array.from(mergedMap.values());
        setWishlistItems(mergedItems);
        setMessage(mergedItems.length === 0 ? "Your wishlist is empty." : "");
      } catch {
        setMessage("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [email, navigate]);

  const refreshWishlist = async () => {
    const res = await getWishlist(email);
    const mergedMap = new Map();
    res.data.forEach((item) => {
      const id = item.product.id;
      if (!mergedMap.has(id)) mergedMap.set(id, { ...item });
    });
    setWishlistItems(Array.from(mergedMap.values()));
    return res;
  };

  const handleRemove = async (productId) => {
    setLoading(true);
    setMessage("");
    try {
      await removeFromWishlist(email, productId);
      const res = await refreshWishlist();
      setMessage(
        res.data.length === 0
          ? "Your wishlist is empty."
          : "Item removed from wishlist."
      );
    } catch {
      setMessage("Failed to remove item.");
    } finally {
      setConfirmId(null);
      setLoading(false);
    }
  };

  // Skeleton cards during first load
  const SkeletonCard = () => (
    <div className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm animate-pulse">
      <div className="h-56 w-full bg-base-200 rounded-t-2xl" />
      <div className="card-body">
        <div className="h-5 w-2/3 bg-base-200 rounded mb-3" />
        <div className="h-4 w-1/3 bg-base-200 rounded mb-6" />
        <div className="h-10 w-full bg-base-200 rounded" />
      </div>
    </div>
  );

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-base-200">
        <Navbar role="BUYER" />
        <main className="flex-grow max-w-7xl mx-auto p-6">
          <h2 className="text-3xl font-semibold mb-8 text-center">My Wishlist</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="BUYER" />
      <main className="flex-grow  max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">My Wishlist</h2>
          {wishlistItems.length > 0 && (
            <span className="badge badge-neutral">
              {wishlistItems.length} item{wishlistItems.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {message && (
          <div
            role="status"
            className={`alert ${message.includes("Failed") ? "alert-error" : "alert-info"} mb-6`}
          >
            <span>{message}</span>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
             {/* some icon for show empty wishlist */}
            </div>
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-base-content/70 mb-6">
              Explore products and tap the heart to save for later.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn btn-primary"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.product.id}
                className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200"
              >
                {/* Image */}
                {item.product.imageUrl ? (
                  <figure className="relative">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-56 w-full object-cover rounded-t-2xl"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-primary">Saved</span>
                    </div>
                  </figure>
                ) : (
                  <div className="h-56 w-full bg-base-200 flex items-center justify-center rounded-t-2xl">
                    <span className="text-base-content/60">No Image</span>
                  </div>
                )}

                {/* Body */}
                <div className="card-body p-4">
                  <h3 className="card-title text-base line-clamp-2">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-base-content/70">
                    Price:{" "}
                    <span className="font-semibold text-success">
                      ${item.product.price}
                    </span>
                  </p>

                  {/* Actions */}
                  <div className="card-actions mt-3">
                    {confirmId === item.product.id ? (
                      <div className="flex w-full gap-2">
                        <button
                          className="btn btn-ghost btn-sm flex-1"
                          onClick={() => setConfirmId(null)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-error btn-sm flex-1"
                          onClick={() => handleRemove(item.product.id)}
                          disabled={loading}
                        >
                          {loading ? "Removing..." : "Confirm remove"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex w-full gap-2">
                        <button
                          onClick={() => setConfirmId(item.product.id)}
                          disabled={loading}
                          className="btn btn-outline btn-error btn-sm flex-1"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() =>
                            navigate("/product/" + item.product.id, {
                              state: { from: "wishlist" },
                            })
                          }
                          className="btn btn-primary btn-sm flex-1"
                        >
                          View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Wishlist;
