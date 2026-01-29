import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";

import { getProductById } from "../services/productService";
import { getProductReviews, addProductReview } from "../services/reviewService";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loggedInEmail = sessionStorage.getItem("userEmail");
  const isLoggedIn = !!loggedInEmail;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const prod = await getProductById(id);
        setProduct(prod.data);

        const rev = await getProductReviews(id);
        setReviews(rev.data || []);

      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Average rating calculation
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // ★ Partial Star Renderer
  const renderStars = (value, clickable = false, setFn = null) => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      let fill = 0;

      if (i + 1 <= Math.floor(value)) fill = 100;
      else if (i < value) fill = (value - i) * 100;

      stars.push(
        <div
          key={i}
          className={`relative inline-block w-6 h-6 ${clickable ? "cursor-pointer" : ""}`}
          onClick={() => clickable && setFn(i + 1)}
        >
          {/* Background Star */}
          <svg
            className="absolute top-0 left-0 w-6 h-6 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Foreground Star */}
          <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fill}%` }}>
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  //  Submit Review
  const handleSubmitReview = async () => {
    if (!isLoggedIn) return navigate("/login");

    if (!rating || !comment.trim()) return alert("Please provide rating and comment.");

    try {
      setSubmitting(true);

      const data = {
        rating,
        comment,
        user_email: loggedInEmail,
        product_id: id,
      };

      const response = await addProductReview(id, data);

      setReviews((prev) => [
        ...prev,
        { ...response.data, userEmail: loggedInEmail },
      ]);

      setRating(0);
      setComment("");

    } catch (err) {
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={sessionStorage.getItem("userRole") || ""} />

      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          product && (
            <>
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="btn bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white btn-sm mb-6"
              >
                ← Back
              </button>

              {/* Product Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image */}
                <div className="card bg-white border shadow-lg">
                  <figure className="bg-gray-200">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} className="w-full h-[28rem] object-cover" />
                    ) : (
                      <div className="w-full h-[28rem] flex items-center justify-center text-gray-400">
                        No Image Available
                      </div>
                    )}
                  </figure>
                </div>

                {/* Details */}
                <aside className="lg:sticky lg:top-6">
                  <div className="card bg-white border shadow-lg">
                    <div className="card-body space-y-3">
                      <h1 className="text-3xl font-bold text-emerald-700">{product.name}</h1>
                      <h3 className="font-semibold text-gray-600">{product.category}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">৳{Number(product.price).toFixed(2)}</span>
                        <span className={`badge ${product.stock > 0 ? "badge-success" : "badge-error"}`}>
                          {product.stock > 0 ? "In stock" : "Out of stock"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(avgRating)}
                        <span className="text-sm font-bold text-red-500">{avgRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
                      </div>

                      <p className="text-gray-600">{product.description}</p>

                      <AddToCartWishlistButtons product={product} size="sm" layout="row" />
                    </div>
                  </div>
                </aside>
              </div>

              {/*  Reviews section */}
              <div className="mt-10 space-y-4">
                {/* Review list */}
                <div className="card bg-white border shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-emerald-600">Customer Reviews</h2>

                    {reviews.length ? (
                      reviews.map((r) => (
                        <div key={r.id} className="border-b pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            {renderStars(r.rating)}
                            <span className="text-xs text-gray-500">
                              {r.userEmail === loggedInEmail ? "You" : r.userEmail}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{r.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No reviews yet.</p>
                    )}
                  </div>
                </div>

                {/* Add Review Form */}
                <div className="card bg-white border shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-emerald-600">Add a Review</h2>

                    {!isLoggedIn ? (
                      <button className="btn btn-success text-white mt-3" onClick={() => navigate("/login")}>
                        Login to Review
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {renderStars(rating, true, setRating)}
                          <span>{rating} / 5</span>
                        </div>

                        <textarea
                          className="textarea textarea-bordered w-full mt-3"
                          placeholder="Write your review..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                          className="btn btn-success text-white mt-3"
                          disabled={submitting}
                          onClick={handleSubmitReview}
                        >
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
