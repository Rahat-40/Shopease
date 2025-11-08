import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMySellerProducts, updateProduct, deleteProduct } from "../services/productService";

function SellerProducts() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getMySellerProducts({
        q: q || undefined,
        category: cat !== "ALL" ? cat : undefined,
        sortBy: "name",
        order: "asc",
      });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMsg("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => {
    const s = new Set(items.map(p => p.category).filter(Boolean));
    return ["ALL", ...Array.from(s)];
  }, [items]);

  const clientFiltered = useMemo(() => {
    let list = items;
    if (status !== "ALL") {
      if (status === "ACTIVE") list = list.filter(p => p.active);
      if (status === "INACTIVE") list = list.filter(p => !p.active);
      if (status === "OUT_OF_STOCK") list = list.filter(p => Number(p.stock || 0) === 0);
    }
    return list;
  }, [items, status]);

  const handleQuickUpdate = async (id, patch) => {
    try {
      setUpdatingId(id);
      await updateProduct(id, patch);
      await fetchProducts();
      setMsg("Updated.");
    } catch {
      setMsg("Failed to update product.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setUpdatingId(id);
      await deleteProduct(id);
      await fetchProducts();
      setMsg("Deleted.");
    } catch {
      setMsg("Failed to delete product.");
    } finally {
      setUpdatingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="SELLER" />
      <main className="flex-grow max-w-7xl mx-auto p-6 w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-emerald-600">My Products</h2>
          <div className="flex flex-wrap gap-3">
            <div className="form-control">
              <div className="input input-bordered flex items-center gap-2 border-emerald-600 bg-white focus-within:ring-2 focus-within:ring-emerald-300 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-60 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input type="text" className="grow bg-white text-emerald-800" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <select className="select select-bordered" value={cat} onChange={(e) => setCat(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select select-bordered" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
            <button className="btn bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white" onClick={fetchProducts}>Apply</button>
            <Link to="/seller/products/new" className="btn btn-success text-white">Add Product</Link>
          </div>
        </div>

        {msg && <div className={`alert ${msg.includes("Failed") ? "alert-error" : "alert-info"} mb-4`}><span>{msg}</span></div>}

        {loading ? (
          <div className="text-center py-10 text-gray-600 font-medium">Loading products...</div>
        ) : clientFiltered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-medium">No products match your filters.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
            <table className="table w-full">
              <thead className="bg-emerald-500 sticky top-0 z-10">
                <tr className="text-white font-semibold">
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Stock</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {clientFiltered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-200"
                    } hover:bg-emerald-50 transition-colors`}
                  >
                    <td className="max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-gray-400 overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt="img"
                              className="w-full h-full object-cover text-gray-800"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-medium truncate text-gray-800 ">
                            {p.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-gray-800">{p.category || "—"}</td>

                    <td className="text-right">
                      <div className="join justify-end">
                        <input
                          className="input input-bordered input-sm text-right join-item w-24 bg-white text-gray-800 border-emerald-600 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-300 focus:outline-none
                 focus:shadow-lg transition-shadow duration-200"
                          defaultValue={Number(p.price || 0).toFixed(2)}
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (!Number.isNaN(v) && v >= 0 && v !== p.price)
                              handleQuickUpdate(p.id, { price: v });
                          }}
                        />
                        <span className="join-item px-2 text-sm text-gray-500">BDT</span>
                      </div>
                    </td>

                    <td className="text-right">
                      <input
                        className="input input-bordered input-sm text-right w-20 bg-white text-gray-800 border-emerald-600 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-300 focus:outline-none
                 focus:shadow-lg transition-shadow duration-200"
                        defaultValue={Number(p.stock || 0)}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v) && v >= 0 && v !== p.stock)
                            handleQuickUpdate(p.id, { stock: v });
                        }}
                      />
                    </td>

                    <td>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!p.active}
                          onChange={(e) =>
                            handleQuickUpdate(p.id, { active: e.target.checked })
                          }
                          disabled={updatingId === p.id}
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-emerald-600 transition-colors duration-200"></div>
                        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                      </label>
                    </td>

                    <td className="text-right">
                      <div className="flex-justify-end space-x-1">
                        <Link
                          to={`/seller/products/${p.id}/edit`}
                          className="btn bg-white border-emerald-600 text-emerald-600 btn-sm  hover:bg-emerald-600 hover:text-white"
                        >
                          Edit
                        </Link>
                        {confirmId === p.id ? (
                          <>
                            <button
                              className="btn bg-white border-red-600 btn-sm  text-red-600"
                              onClick={() => setConfirmId(null)}
                              disabled={updatingId === p.id}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-error btn-sm "
                              onClick={() => handleDelete(p.id)}
                              disabled={updatingId === p.id}
                            >
                              {updatingId === p.id ? "Deleting..." : "Confirm"}
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline btn-error btn-sm "
                            onClick={() => setConfirmId(p.id)}
                            disabled={updatingId === p.id}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </main>
      <Footer />
    </div>
  );
}

export default SellerProducts;
