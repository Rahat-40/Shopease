import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminListOrders } from "../services/admin";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function AdminOrders() {
  const [status, setStatus] = useState("");
  const [packages, setPackages] = useState([]);
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

  // funtion for show all orders
  const loadPackages = async () => {
    setLoading(true);
    try {
      const r = await adminListOrders(status);
      setPackages(r.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPackages(); }, [status]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-emerald-600">Order Packages</h1>
          <div className="flex gap-2">
            {/** sorting section according to status*/}
            <select className="select select-bordered" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option>PLACED</option>
              <option>CONFIRMED</option>
              <option>SHIPPED</option>
              <option>DELIVERED</option>
              <option>CANCELLED</option>
            </select>
            <button className="btn" onClick={loadPackages}>Filter</button>
          </div>
        </div>

        {/** table of all orders*/}
        <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
          {loading ? <div className="p-6">Loading...</div> : (
            <table className="table w-full">
              <thead className="bg-emerald-600 sticky top-0 z-10">
                <tr className="text-white font-semibold">
                  <th>Package ID</th>
                  <th>Buyer</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {packages.map((pkg, i) => (
                  <tr key={pkg.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-200"}>
                    <td>{pkg.id}</td>
                    <td>{pkg.buyerEmail}</td>
                    <td><span className={`badge ${statusColor(pkg.status)}`}>{pkg.status}</span></td>
                    <td>{pkg.createdAt ? dayjs(pkg.createdAt).format("DD MMM YYYY, hh:mm A") : "-"}</td>
                    <td>
                      <Link
                        className="btn btn-sm bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white"
                        to={`/admin/orders/${pkg.id}`}
                      >
                        View        {/** button for vies details of order */}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
