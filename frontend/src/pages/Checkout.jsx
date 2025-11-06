import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { placeOrder } from "../services/orderService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(() =>
    state?.items
      ? state.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          price: Number(item.product.price) || 0,
          imageUrl: item.product.imageUrl || "/placeholder.png",
        }))
      : []
  );

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // redirect to cart if no items
  useEffect(() => {
    if (!state?.items || state.items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [state, navigate]);

  const handleQuantityChange = (id, value) => {
    const quantity = Number(value);
    if (Number.isNaN(quantity) || quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleIncrement = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecrement = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((it) => it.product.id !== id));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setMessage("");
    // const email = localStorage.getItem("userEmail");
        const email = sessionStorage.getItem("userEmail");
    try {
      await Promise.all(
        items.map((item) =>
          placeOrder({
            buyerEmail: email,
            quantity: item.quantity,
            product: { id: item.product.id },
          })
        )
      );
      setMessage("✅ Order placed successfully!");
      setTimeout(() => navigate("/buyer"), 1500);
    } catch (e) {
      setMessage("❌ Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalPrice = subtotal; // extend later with shipping/tax when available

  if (items.length === 0)
    return <p className="text-center mt-6">No items to checkout.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="BUYER" />

      <main className="flex-grow">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl font-semibold text-center mb-6">Checkout</h1>

          {/* Inline feedback */}
          {message && (
            <div
              role="status"
              className={`alert ${
                message.startsWith("✅") ? "alert-success" : "alert-error"
              } mb-4`}
            >
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <section className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="card bg-base-100 shadow">
                  <div className="card-body p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 rounded object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-base-content/70">
                              Unit price: ${item.price.toFixed(2)}
                            </p>
                            <div className="mt-1">
                              <span className="badge badge-success badge-sm">
                                In stock
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold transition-colors">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              className="btn btn-ghost btn-xs mt-1"
                              disabled={loading}
                              onClick={() => handleRemove(item.product.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          {/* Quantity control: DaisyUI join */}
                          <div className="join">
                            <button
                              className="btn join-item"
                              aria-label="Decrease quantity"
                              onClick={() => handleDecrement(item.product.id)}
                              disabled={loading}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product.id,
                                  e.target.value
                                )
                              }
                              className="input input-bordered join-item w-20 text-center"
                              disabled={loading}
                              aria-live="polite"
                              aria-label="Quantity"
                            />
                            <button
                              className="btn join-item"
                              aria-label="Increase quantity"
                              onClick={() => handleIncrement(item.product.id)}
                              disabled={loading}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs text-base-content/60 mt-1">
                            Tip: Use buttons or edit the field for precise
                            quantities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Right: Summary */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <div className="card bg-base-100 shadow">
                  <div className="card-body space-y-3">
                    <h2 className="card-title">Order Summary</h2>

                    <div className="flex justify-between text-sm">
                      <span>Items ({items.length})</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-base-content/70">
                        $00.00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes</span>
                      <span className="text-base-content/70">$00.00</span>
                    </div>

                    <div className="divider my-2" />

                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className={`btn btn-primary w-full ${
                        loading ? "btn-disabled" : ""
                      }`}
                    >
                      {loading ? "Placing Order..." : "Place Order"}
                    </button>

                    <div className="text-xs text-base-content/60">
                      By placing your order, you agree to ShopEase’s Terms and
                      Privacy Policy.
                    </div>
                  </div>
                </div>
                
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
