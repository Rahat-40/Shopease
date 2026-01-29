import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initiatePayment, placeCodOrder } from "../services/orderService"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // const email = sessionStorage.getItem("userEmail"); 
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

  //  Payment Method Selection (Default to ONLINE)
  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // Options: 'ONLINE', 'COD'

  // Shipping and Contact Information
  const [shippingData, setShippingData] = useState({
    buyerName: "",
    buyerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostcode: "",
  });

  // redirect to cart if no items
  useEffect(() => {
    if (!state?.items || state.items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [state, navigate]);

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };
  
  // Check if all shipping fields are filled
  const isShippingValid = useMemo(() => {
    return (
      shippingData.buyerName.trim() &&
      shippingData.buyerPhone.trim() &&
      shippingData.shippingAddress.trim() &&
      shippingData.shippingCity.trim() &&
      shippingData.shippingPostcode.trim()
    );
  }, [shippingData]);


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

    if (items.filter((it) => it.product.id !== id).length === 0) {
        navigate("/cart", { replace: true });
    }
  };

  //  Calls initiatePayment or placeCodOrder
  const handlePlaceOrder = async () => {
    setLoading(true);
    setMessage("");

    if (!isShippingValid) {
        setMessage("❌ Please fill out all shipping and contact information.");
        setLoading(false);
        return;
    }
    
    // 1. Prepare Payload
    const orderPackagePayload = {
        orders: items.map((item) => ({
            quantity: item.quantity,
            product: { id: item.product.id }, 
        })),
        ...shippingData,
        paymentMethod: paymentMethod //  Sends the selected method to backend
    };


    try {
      if (paymentMethod === "ONLINE") {

          const response = await initiatePayment(orderPackagePayload); 
          const redirectUrl = response.data;
          
          if (redirectUrl) {
              window.location.replace(redirectUrl);
          } else {
              setMessage("❌ Payment gateway URL not received. Please try again.");
          }

      } else {
          const response = await placeCodOrder(orderPackagePayload);
          
          const transactionId = response.data.transactionId || "COD"; 
          // Redirect to success page immediately
          navigate(`/order/success/${transactionId}`);
      }
    } catch (e) {
      // Safely handle object/string error responses
      const responseData = e.response?.data;
      let errorMsg = "Order failed. Check stock and try again.";
      
      if (typeof responseData === 'object' && responseData !== null) {
          errorMsg = responseData.message || responseData.error || JSON.stringify(responseData);
      } else if (responseData) {
          errorMsg = responseData; 
      }
      
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false); 
    }
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalPrice = subtotal; 

  if (items.length === 0)
    return <p className="text-center mt-6">Redirecting to cart...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="BUYER" />

      <main className="flex-grow">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-emerald-600 mb-6">Checkout</h1>

          {/* Inline feedback */}
          {message && (
            <div
              role="status"
              className={`alert ${
                message.startsWith("❌") ? "alert-error" : "alert-success"
              } mb-4`}
            >
              <span>{message}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Shipping & Payment Selection */}
            <section className="lg:col-span-2 space-y-6">
                
              {/* Shipping Info Card */}
              <div className="card bg-white shadow-lg border border-gray-200">
                  <div className="card-body">
                      <h2 className="card-title text-emerald-600 border-b pb-2 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657m1.144-8.847A5.992 5.992 0 0112 4a5.992 5.992 0 014.503 2.19m0 0l.001.001M12 21v-4m0-4h.01M12 12V3"/></svg>
                          Shipping & Contact Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Full Name (e.g., Jane Doe)" name="buyerName" value={shippingData.buyerName} onChange={handleShippingChange} className="input input-bordered w-full
                           bg-gray-300 text-black font-semibold" required />
                          <input type="tel" placeholder="Phone Number (e.g., 01XXXXXXXXX)" name="buyerPhone" value={shippingData.buyerPhone} onChange={handleShippingChange} className="input input-bordered w-full bg-gray-300 text-black" required />
                          <input type="text" placeholder="Shipping Address (Street/Area)" name="shippingAddress" value={shippingData.shippingAddress} onChange={handleShippingChange} className="input input-bordered w-full md:col-span-2 bg-gray-300 text-black" required />
                          <input type="text" placeholder="City/District" name="shippingCity" value={shippingData.shippingCity} onChange={handleShippingChange} className="input input-bordered w-full bg-gray-300 text-black" required />
                          <input type="text" placeholder="Postcode" name="shippingPostcode" value={shippingData.shippingPostcode} onChange={handleShippingChange} className="input input-bordered w-full bg-gray-300 text-black" required />
                      </div>
                  </div>
              </div>


              {/* Items List (placeholder for complexity, assuming existing code) */}
              {items.map((item) => (
                <div key={item.product.id} className="card bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">  

                 <div className="card-body p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 rounded object-cover bg-gray-300 text-gray-600"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Unit price: ৳{item.price.toFixed(2)}
                            </p>
                            <div className="mt-1">
                              <span className="badge badge-success badge-sm">
                                In stock
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600 transition-colors">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </p>
                            <button
                              className="btn border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white btn-xs mt-3"
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
                          <p className="text-xs text-gray-500 mt-1">
                            Tip: Use buttons or edit the field for precise
                            quantities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/*  Payment Method Selection Card */}
              <div className="card bg-white shadow-lg border border-gray-200">
                  <div className="card-body">
                      <h2 className="card-title text-emerald-600 border-b pb-2 mb-4">
                          Payment Method
                      </h2>
                      <div className="flex flex-col gap-3">
                          
                          {/* Online Payment */}
                          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                              <input 
                                  type="radio" 
                                  name="paymentMethod" 
                                  value="ONLINE" 
                                  checked={paymentMethod === "ONLINE"}
                                  onChange={() => setPaymentMethod("ONLINE")}
                                  className="radio radio-success mr-4" 
                              />
                              <div className="flex-1">
                                  <span className="font-bold text-gray-800">Pay Online</span>
                                  <p className="text-sm text-gray-500">Secure payment via SSLCommerz (Card, Mobile Banking)</p>
                              </div>
                              <img src="https://securepay.sslcommerz.com/public/image/sslcommerz.png" alt="SSL" className="h-8 object-contain" />
                          </label>

                          {/* Cash on Delivery */}
                          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                              <input 
                                  type="radio" 
                                  name="paymentMethod" 
                                  value="COD" 
                                  checked={paymentMethod === "COD"}
                                  onChange={() => setPaymentMethod("COD")}
                                  className="radio radio-success mr-4" 
                              />
                              <div className="flex-1">
                                  <span className="font-bold text-gray-800">Cash on Delivery</span>
                                  <p className="text-sm text-gray-500">Pay with cash upon receiving your order.</p>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </label>

                      </div>
                  </div>
              </div>

              
            </section>

            {/* Right: Summary */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <div className="card bg-white shadow-md hover:shadow-xl border border-gray-200 transition duration-300">
                  <div className="card-body space-y-3">
                    <h2 className="card-title text-emerald-600 font-bold">Order Summary</h2>

                    <div className="flex justify-between text-sm text-gray-800 font-semibold">
                      <span>Items ({items.length})</span>
                      <span>৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-800">
                      <span>Shipping</span>
                      <span className="text-gray-500">
                        ৳ 00.00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-800">
                      <span>Taxes</span>
                      <span className="text-gray-500">৳ 00.00</span>
                    </div>

                    <hr className="border-t border-gray-500 my-2" />

                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-red-600">৳{totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || !isShippingValid}
                      className={`btn bg-emerald-600 border-emerald-600 w-full hover:bg-emerald-700 ${
                        loading || !isShippingValid ? "btn-disabled" : ""
                      }`}
                    >
                      {loading 
                        ? "Processing..." 
                        : paymentMethod === 'COD' ? "Confirm COD Order" : "Pay Now & Order" // UPDATED BUTTON TEXT
                      }
                    </button>

                    {!isShippingValid && (
                       <p className="text-xs text-red-500 mt-1">
                        Please fill in shipping details to proceed.
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
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