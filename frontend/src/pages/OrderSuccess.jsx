import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderPackageByTrxId } from '../services/orderService';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function OrderSuccess() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches order details to determine payment method and status
    const loadOrder = async () => {
      if (!transactionId || transactionId === 'undefined') {
        setLoading(false);
        return;
      }
      try {
        const response = await fetchOrderPackageByTrxId(transactionId);
        setOrder(response.data);
      } catch (e) {
        console.error("Failed to load order:", e);
        // On failure, redirect to the orders list
        navigate("/buyer/orders", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [transactionId, navigate]);

  if (loading) {
    return (
        <div className="text-center mt-20">
            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
            <p className="text-gray-600 mt-2">Finalizing your order...</p>
        </div>
    );
  }
  
  if (!order) {
      return (
        <div className="text-center mt-20 text-red-500">
            <p>Order status could not be confirmed. Check your order history.</p>
            <button onClick={() => navigate('/buyer/orders')} className="btn btn-sm mt-4">Go to Orders</button>
        </div>
      );
  }

  //  Dynamic Message Generation based on fetched data
  const isCod = order.paymentMethod === 'COD';
  const isPaid = order.paymentStatus === 'PAID';
  
  const title = isCod 
      ? "🎉 COD Order Placed!" 
      : isPaid 
        ? "✅ Payment Successful!" 
        : "Order Confirmed";

  const message = isCod 
      ? "Your Cash on Delivery (COD) order has been successfully placed. Your package will be prepared and shipped shortly. Please keep the exact cash amount ready upon delivery."
      : isPaid 
        ? "Your order is confirmed, and the payment has been successfully completed. We are now processing your items for shipment."
        : "Your order is confirmed and currently being processed.";


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar role="BUYER" />
        <main className="flex-grow flex items-center justify-center p-6">
            <div className="card w-full max-w-xl bg-white shadow-xl border border-gray-200 text-center">
                <div className="card-body">
                    {/* Icon changes based on status */}
                    {isCod ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}

                    <h2 className={`card-title mx-auto text-3xl mt-4 ${isCod ? "text-emerald-700" : "text-success"}`}>
                        {title}
                    </h2>
                    
                    <p className="text-gray-600 mt-2">{message}</p>
                    
                    <div className="text-left bg-gray-100 p-4 rounded-lg mt-4 space-y-1 text-gray-800">
                        <p><strong>Order ID:</strong> <span className="text-gray-800">{order.id}</span></p>
                        <p><strong>Transaction ID:</strong> {order.transactionId}</p>
                        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Total Amount:</strong> ৳{order.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="card-actions justify-center mt-6">
                        <button 
                            onClick={() => navigate("/buyer/orders", { replace: true })}
                            className="btn bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Go to Orders
                        </button>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}

export default OrderSuccess;