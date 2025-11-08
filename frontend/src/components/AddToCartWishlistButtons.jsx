import React, { useState } from "react";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";
import { useNavigate } from "react-router-dom";

function AddToCartWishlistButtons({ product, size = "sm", layout = "row-joined" }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const buyerEmail = sessionStorage.getItem("userEmail");
  const token = sessionStorage.getItem("token");

  const requireLogin = () => {
    setMessage("Please login to continue.");
    setTimeout(() => setMessage(""), 2000);
    navigate("/login");
  };

  const handleAddToCart = async () => {
    if (!token || !buyerEmail) return requireLogin();
    try {
      setLoading(true);
      await addToCart({ buyerEmail, quantity: 1, product: { id: product.id } });
      setMessage("Added to cart!");
    } catch {
      setMessage("Failed to add to cart.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!token || !buyerEmail) return requireLogin();
    try {
      setLoading(true);
      await addToWishlist({ buyerEmail, product: { id: product.id } });
      setMessage("Added to wishlist!");
    } catch {
      setMessage("Failed to add to wishlist.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // size variants
  const btnSize = size === "xs" ? "btn-xs" : size === "sm" ? "btn-sm" : "btn-md";

  // layout variants
  const isJoined = layout === "row-joined";
  const containerClass = isJoined
    ? "join"
    : layout === "column"
    ? "flex flex-col gap-2"
    : "flex items-center gap-2"; // row with gaps

  const commonBtn = `
    btn ${btnSize} font-medium transition-all duration-200
    shadow-sm hover:shadow-md hover:-translate-y-0.5 
    focus:outline-none focus:ring-2 focus:ring-emerald-400
    ${loading ? "btn-disabled opacity-70" : ""}
  `;

  const joinedClass = isJoined ? "join-item" : "";

  return (
    <div className="relative">
      <div className={containerClass}>
        <button
          className={`${commonBtn} ${joinedClass} btn bg-emerald-600 text-white border-emerald-600 hover:bg-white hover:text-emerald-600`}
          onClick={handleAddToCart}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>

        <button
          className={`${commonBtn} ${joinedClass} btn-outline border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white`}
          onClick={handleAddToWishlist}
        >
          Add to Wishlist
        </button>
      </div>

      {message && (
        <div
          className={`mt-2 transition-all duration-300 ${
            message.includes("Failed") ? "text-red-500" : "text-green-600"
          } text-sm font-medium`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default AddToCartWishlistButtons;
