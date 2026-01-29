import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PaymentStatus() {
    // 'status' will be 'success' or 'fail' from the backend redirect URL
    const { status, transactionId } = useParams(); 
    const navigate = useNavigate();

    const isSuccess = status === "success";
    const isError = status === "fail"; // Covers both FAILED and CANCELLED

    // Navigate to buyer orders after a short delay
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/buyer/orders", { replace: true });
        }, 10000); // 10 seconds delay before redirecting
        
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar role="BUYER" />
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="card w-full max-w-lg bg-white shadow-xl border border-gray-200 text-center">
                    <div className="card-body">
                        {isSuccess ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}

                        <h2 className={`card-title mx-auto text-3xl mt-4 ${isSuccess ? "text-success" : "text-error"}`}>
                            {isSuccess ? "Payment Successful! 🎉" : "Transaction Unsuccessful "}
                        </h2>
                        
                        <p className="text-gray-600 mt-2">
                            {isSuccess 
                                ? "Your order has been placed and payment confirmed by SSLCommerz. Stock has been deducted."
                                : "The payment attempt did not complete. Your order status has been marked as Failed or Cancelled in your order history."
                            }
                        </p>
                        
                        {transactionId && transactionId !== 'UNKNOWN' && (
                            <div className="badge badge-neutral mt-3">Transaction ID: {transactionId}</div>
                        )}

                        <p className="text-sm text-gray-500 mt-4">
                            You will be automatically redirected to your order history in 10 seconds.
                        </p>
                        
                        <div className="card-actions justify-center mt-6">
                            <button 
                                onClick={() => navigate("/buyer/orders", { replace: true })}
                                className="btn btn-emerald-600"
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

export default PaymentStatus;