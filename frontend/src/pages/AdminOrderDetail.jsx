import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminGetOrder } from "../services/admin";
import dayjs from "dayjs";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  // handle badge color
  const statusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "badge-success";
      case "SHIPPED": return "badge-info";
      case "CONFIRMED": return "badge-warning";
      case "PLACED": return "badge-neutral";
      case "CANCELLED": return "badge-error";
      default: return "badge-neutral";
    }
  };
 // handle load order
  const loadPackage = async () => {
    setLoading(true);
    try {
      const r = await adminGetOrder(id);
      setPkg(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPackage(); }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!pkg) return <div className="p-6 text-red-600">Package not found</div>;

  const totalAmount = pkg.orders.reduce(
    (sum, item) => sum + (item.quantity * (item.product?.price || 0)),
    0
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-4xl mx-auto p-6 w-full">
        {/* Package Info */}
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h1 className="text-2xl font-semibold text-emerald-600 mb-2">Order Id #{pkg.id}</h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="text-gray-900 font-medium">Buyer: {pkg.buyerEmail}</div>
            <div className="text-gray-900 font-medium">Status: 
              <span className={`ml-2 badge ${statusColor(pkg.status)}`}>{pkg.status}</span>
            </div>
            <div className="text-gray-900 font-medium">
              Ordered On: {pkg.orderDate ? dayjs(pkg.orderDate).format("DD MMM YYYY, hh:mm A") : "-"}
            </div>
            <div className="text-red-600 font-medium">Total: ${totalAmount.toFixed(2)}</div>
          </div>

          {/* --- NEW SECTION: Shipping & Payment Details --- */}
                    <div className="mt-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        
                        {/* Column 1: Shipping Info */}
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Shipping Details</h4>
                          <p className="text-gray-600">
                            <span className="font-semibold">Receiver:</span> {pkg.buyer_name || pkg.buyerName}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">Phone:</span> {pkg.buyer_phone || pkg.buyerPhone}
                          </p>
                          <p className="text-gray-600 mt-1">
                            {pkg.shipping_address || pkg.shippingAddress}, <br />
                            {pkg.shipping_city || pkg.shippingCity} - {pkg.shipping_postcode || pkg.shippingPostcode}
                          </p>
                        </div>

                        {/* Column 2: Payment Info */}
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Payment Info</h4>
                          <p className="text-gray-600">
                            <span className="font-semibold">Method:</span> {pkg.payment_method || pkg.paymentMethod || "N/A"}
                          </p>
                          <p className="text-gray-600">
                             <span className="font-semibold">Status:</span> 
                             <span className={`ml-2 badge badge-sm ${pkg.payment_status === 'PAID' ? 'badge-success' : 'badge-ghost'}`}>
                               {pkg.payment_status || pkg.paymentStatus}
                             </span>
                          </p>
                          <p className="text-gray-600 mt-1 truncate">
                            <span className="font-semibold">Trx ID:</span> 
                            <span className="font-mono text-xs ml-1 bg-gray-200 px-1 rounded">
                              {pkg.transaction_id || pkg.transactionId || "N/A"}
                            </span>
                          </p>
                        </div>

                      </div>
                    </div>
                    {/* --- END NEW SECTION --- */}
        </div>

        {/* Items List (Cart Style) */}
        <div className="flex flex-col gap-4">
          {pkg.orders.map((item) => (
            <div key={item.id} className="flex items-center bg-white rounded shadow p-4 gap-4">
              <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-gray-800">{item.product?.name || "Unknown Product"}</div>
                <div className="text-gray-800 text-sm">Seller: {item.product?.sellerEmail || item.sellerEmail}</div>
                <div className="text-gray-800 text-sm">Quantity: {item.quantity}</div>
                <div className="text-emerald-600 text-m">Price: ${item.product?.price?.toFixed(2) || "0.00"}</div>
                <div className="text-red-600 text-m">Total: ${(item.product?.price * item.quantity || 0).toFixed(2)}</div>
                {/* <div className="mt-1">
                  <span className={`badge ${statusColor(item.status)}`}>{item.status}</span>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link to="/admin/orders" className="btn btn-sm bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white">
            Back
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
