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

  const commonBtn = `btn ${btnSize} shadow-sm hover:shadow ${loading ? "btn-disabled" : ""}`;
  const joinedClass = isJoined ? "join-item" : "";

  return (
    <div>
      <div className={containerClass}>
        <button
          className={`${commonBtn} ${joinedClass} btn-primary`}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>

        <button
          className={`${commonBtn} ${joinedClass} btn-outline`}
          onClick={handleAddToWishlist}
        >
         Add to Wishlist
        </button>
      </div>

      {message && (
        <div className="mt-2">
          <div className={`alert ${message.includes("Failed") ? "alert-error" : "alert-success"} py-1 px-2 text-sm`}>
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddToCartWishlistButtons;
