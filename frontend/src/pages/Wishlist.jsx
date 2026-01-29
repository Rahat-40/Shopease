import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { getProductReviews } from "../services/reviewService"; // Import review service
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Wishlist() {
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // Helper to fetch ratings for a list of wishlist items
  const fetchRatingsForItems = async (items) => {
    return await Promise.all(
      items.map(async (item) => {
        try {
          // Fetch reviews for the specific product inside the wishlist item
          const revRes = await getProductReviews(item.product.id);
          const reviews = revRes.data || [];
          const avgRating = reviews.length
            ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
            : 0;
          const totalReviews = reviews.length;

          // Return item with updated product details
          return {
            ...item,
            product: { ...item.product, avgRating, totalReviews },
          };
        } catch {
          // If review fetch fails, return with 0 rating
          return {
            ...item,
            product: { ...item.product, avgRating: 0, totalReviews: 0 },
          };
        }
      })
    );
  };

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    async function fetchWishlist() {
      try {
        const res = await getWishlist(email);
        
        // Deduplicate logic
        const mergedMap = new Map();
        res.data.forEach((item) => {
          const id = item.product.id;
          if (!mergedMap.has(id)) mergedMap.set(id, { ...item });
        });
        const uniqueItems = Array.from(mergedMap.values());

        // Fetch ratings for these items
        const itemsWithRatings = await fetchRatingsForItems(uniqueItems);

        setWishlistItems(itemsWithRatings);
        setMessage(itemsWithRatings.length === 0 ? "Your wishlist is empty." : "");
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
    const uniqueItems = Array.from(mergedMap.values());
    
    // We also need to fetch ratings again on refresh to keep UI consistent
    const itemsWithRatings = await fetchRatingsForItems(uniqueItems);
    setWishlistItems(itemsWithRatings);
    return { data: itemsWithRatings };
  };

  const handleRemove = async (productId) => {
    setLoading(true); // Show loading state while processing
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

  // Star Render Helper (from your reference)
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      let fillPercent = 0;
      if (i + 1 <= Math.floor(rating)) {
        fillPercent = 100;
      } else if (i < rating) {
        fillPercent = (rating - i) * 100;
      }

      stars.push(
        <div key={i} className="relative inline-block w-4 h-4 mr-0.5">
          <svg
            className="w-full h-full text-gray-300 absolute top-0 left-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
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

  const SkeletonCard = () => (
    <div className="card bg-white border border-gray-200 rounded-2xl shadow-sm animate-pulse">
      <div className="h-56 w-full bg-gray-200 rounded-t-2xl" />
      <div className="card-body">
        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-1/3 bg-gray-200 rounded mb-6" />
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar role="BUYER" />
        <main className="flex-grow max-w-7xl mx-auto p-6">
          <h2 className="text-3xl font-semibold mb-8 text-center text-emerald-600">My Wishlist</h2>
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="BUYER" />
      <main className="flex-grow max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-emerald-600">My Wishlist</h2>
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
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">
              Explore products and tap the heart to save for later.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white transition border-none"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              // Prepare Variables
              const inStock = item.product.stock == null ? true : item.product.stock > 0;
              const rating = item.product.avgRating || 0;
              const reviewCount = item.product.totalReviews || 0;

              return (
                <div
                  key={item.product.id}
                  className="card bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
                >
                  {/* Image */}
                  {item.product.imageUrl ? (
                    <figure className="relative">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-56 w-full object-cover rounded-t-2xl text-gray-500 bg-gray-200"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="badge bg-emerald-600 border-none text-white">Saved</span>
                      </div>
                    </figure>
                  ) : (
                    <div className="h-56 w-full bg-gray-100 flex items-center justify-center rounded-t-2xl">
                      <span className="text-base-content/60">No Image</span>
                    </div>
                  )}

                  {/* Body */}
                  <div className="card-body p-4">
                    {/* Title */}
                    <h3 className="card-title text-base text-gray-800 line-clamp-2">
                      {item.product.name}
                    </h3>
                    
                    {/* Category */}
                    <h5 className="text-xs text-gray-500 mb-1">{item.product.category}</h5>

                    {/* Ratings (New) */}
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(rating)}
                       <span className="text-xs font-semibold text-red-500">
                        {rating> 0 ? rating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({reviewCount})
                      </span>
                    </div>

                    {/* Price and Stock (New Layout for this section) */}
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-semibold text-gray-800">Price: <span className="font-semibold text-red-600">৳{item.product.price}</span></span>
                       <span className={`badge badge-xs py-2 ${inStock ? "badge-success text-white" : "badge-error text-white"}`}>
                          {inStock ? "In stock" : "Out of stock"}
                       </span>
                    </div>

                    {/* Actions */}
                    <div className="card-actions mt-3">
                      {confirmId === item.product.id ? (
                        <div className="flex w-full gap-2">
                          <button
                            className="btn btn-sm flex-1"
                            onClick={() => setConfirmId(null)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn bg-red-500 text-white btn-sm flex-1 border-none hover:bg-red-600"
                            onClick={() => handleRemove(item.product.id)}
                            disabled={loading}
                          >
                            {loading ? "..." : "Confirm"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex w-full gap-2">
                          <button
                            onClick={() => setConfirmId(item.product.id)}
                            disabled={loading}
                            className="btn btn-outline btn-error btn-sm flex-1 hover:bg-red-500 hover:text-white"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() =>
                              navigate("/products/" + item.product.id, {
                                state: { from: "wishlist" },
                              })
                            }
                            className="btn bg-emerald-600 border-emerald-600 hover:bg-white hover:text-emerald-600 btn-sm flex-1 text-white"
                          >
                            View
                          </button>
                        </div>
                      )}
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

export default Wishlist;