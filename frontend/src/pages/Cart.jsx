import React, { useEffect, useState, useMemo } from "react";
import { getCart, removeFromCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Cart() {
 
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
    async function fetchCart() {
      setLoading(true);
      try {
        const res = await getCart(email);
        const mergedMap = new Map();
        res.data.forEach((item) => {
          const id = item.product.id;
          if (mergedMap.has(id)) {
            const existing = mergedMap.get(id);
            mergedMap.set(id, {
              ...existing,
              quantity: existing.quantity + item.quantity,
            });
          } else {
            mergedMap.set(id, { ...item });
          }
        });
        const merged = Array.from(mergedMap.values());
        setCartItems(merged);
        setMessage(merged.length === 0 ? "Your cart is empty." : "");
      } catch {
        setMessage("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [email, navigate]);

  const handleSelectItem = (productId, checked) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: checked }));
  };

  const handleRemoveItem = async (productId) => {
    setLoading(true);
    setMessage("");
    try {
      await removeFromCart(email, productId);
      const res = await getCart(email);
      setCartItems(res.data);
      setMessage(res.data.length === 0 ? "Your cart is empty." : "Item removed from cart.");
    } catch {
      setMessage("Failed to remove item.");
    } finally {
      setLoading(false);
    }
  };

  const selectedList = useMemo(
    () => cartItems.filter((it) => selectedItems[it.product.id]),
    [cartItems, selectedItems]
  );
  const subtotal = useMemo(
    () =>
      selectedList.reduce(
        (sum, it) => sum + Number(it.product.price || 0) * Number(it.quantity || 0),
        0
      ),
    [selectedList]
  );

  const handleProceedToCheckout = () => {
    if (selectedList.length === 0) {
      setMessage("Please select at least one item.");
      return;
    }
    navigate("/checkout", { state: { items: selectedList } });
  };

  if (loading)
    return (
      <>
        <Navbar role="BUYER" />
        <p className="text-center mt-6">Loading cart...</p>
        <Footer />
      </>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="BUYER" />

      <main className="flex-grow max-w-6xl mx-auto p-6">
        <div className="relative mb-6">
          <div className="flex justify-center">
            <h2 className="text-3xl font-semibold text-emerald-600">My Cart</h2>
          </div>
          {cartItems.length > 0 && (
            <div className="absolute inset-y-0 right-0 hidden sm:flex items-center">
              <span className="badge badge-neutral">
                {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {message && (
          <div
            role="status"
            className={`alert ${message.includes("Failed") ? "alert-error" : "alert-info"} mb-4`}
          >
            <span>{message}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base-content/70 mb-4">Your cart is empty.</p>
            <button onClick={() => navigate("/products")} className="btn btn-emerald-600">
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: items (2 cols on lg+) */}
            <section className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="card bg-white shadow-md border border-gray-200 hover:shadow-xl transition duration-300">
                  <div className="card-body p-4 sm:p-5">
                    <div className="flex gap-4 items-start">
                      {/* Checkbox column */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-success"
                          checked={!!selectedItems[item.product.id]}
                          onChange={(e) => handleSelectItem(item.product.id, e.target.checked)}
                        />
                      </div>

                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover text-gray-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base-content/60 text-sm">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-base-200 line-clamp-1">{item.product.name}</h3>
                            <p className="text-sm text-red-500">
                              Unit: ৳ {Number(item.product.price || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ৳{(Number(item.product.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                            </p>
                            <button
                              className="btn bg-white  text-red-600 border-red-600 hover:bg-red-600 hover:text-white btn-xs mt-1"
                              onClick={() => handleRemoveItem(item.product.id)}
                              disabled={loading}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Quantity display; optionally replace with buttons + input per best practices */}
                        <p className="mt-2 text-sm text-base-200">
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Right: summary */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
               <div className="card bg-white shadow-md hover:shadow-xl border border-gray-200 transition duration-300">
                  <div className="card-body space-y-3">
                    <h3 className="card-title text-emerald-600">Order Summary</h3>
                    <div className="flex justify-between text-sm text-base-300">
                      <span>Selected items</span>
                      <span>{selectedList.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-base-200">
                      <span>Subtotal</span>
                      <span>৳ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-base-200">
                      <span>Shipping </span>
                      <span className="text-gray-500"> ৳00.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-base-300">
                      <span>Taxes</span>
                      <span className="text-gray-500">৳00.00</span>
                    </div>
                    <hr className="border-t border-gray-500 my-2" />
                    <div className="flex justify-between font-bold text-base-300">
                      <span>Total</span>
                      <span className="text-red-500">৳{subtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      className="btn bg-emerald-600 border-none hover:bg-emerald-700 w-full"
                      disabled={selectedList.length === 0 || loading}
                    >
                      Proceed to Checkout
                    </button>
                    {selectedList.length === 0 && (
                      <p className="text-xs text-base-content/60">
                        Select items to enable checkout.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;



