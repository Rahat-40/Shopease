// src/pages/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminListProducts, adminUpdateProduct, adminToggleProductActive, adminDeleteProduct } from "../services/admin";

export default function AdminProducts() {
  const [filters, setFilters] = useState({ q: "", category: "" });
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.category) params.category = filters.category;
      const res = await adminListProducts(params);
      setItems(res.data || []);
    } catch {
      setMsg("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => { setEditing(p.id); setForm({ ...p }); };
  const cancelEdit = () => { setEditing(null); setForm({}); };
  const save = async () => {
    try {
      await adminUpdateProduct(editing, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setMsg("Saved");
      setEditing(null);
      load();
    } catch { setMsg("Failed to save."); }
  };

  const toggleActive = async (id, active) => {
    try {
      await adminToggleProductActive(id, active);
      setMsg("Status updated");
      load();
    } catch { setMsg("Failed to update status."); }
  };

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDeleteProduct(id);
      setMsg("Product deleted");
      load();
    } catch { setMsg("Failed to delete."); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-emerald-600">Products</h1>
          <div className="flex gap-2">
            <input className="input input-bordered border-emerald-600 bg-white focus:ring-2 focus:ring-emerald-300 transition-all text-emerald-800 font-bold" placeholder="Search name" value={filters.q} onChange={e=>setFilters(f=>({...f, q:e.target.value}))} />
            <input className="input input-bordered border-emerald-600 bg-white focus:ring-2 focus:ring-emerald-300 transition-all text-emerald-800 font-bold" placeholder="Filter category" value={filters.category} onChange={e=>setFilters(f=>({...f, category:e.target.value}))} />
            <button className="btn bg-emerald-600 text-white border-emerald-600 hover:bg-white hover:text-emerald-600" onClick={load}>Apply</button>
          </div>
        </div>
        {msg && <div className="alert alert-info mb-3"><span>{msg}</span></div>}
        <div className="card bg-white border border-gray-200 shadow-2xl rounded-lg">
          <div className="card-body overflow-x-auto">
            {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> : (
              <table className="table w-full">
                <thead className="bg-emerald-600 sticky top-0 z-10"><tr className="text-white font-semibold"><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Seller</th><th>Active</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {items.map((p,i) => (
                    <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-200"}>
                      <td className="text-gray-900">{p.id}</td>
                      <td className="text-gray-900">
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm bg-gray-400 focus:ring-2 focus:ring-emerald-300 transition-all" value={form.name||""} onChange={e=>setForm(s=>({...s,name:e.target.value}))} />
                        ) : p.name}
                      </td>
                      <td  className="text-gray-900">
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm bg-gray-400 focus:ring-2 focus:ring-emerald-300 transition-all" value={form.category||""} onChange={e=>setForm(s=>({...s,category:e.target.value}))} />
                        ) : (p.category || "—")}
                      </td>
                      <td  className="text-red-500">
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm w-24 text-right bg-gray-400 focus:ring-2 focus:ring-emerald-300 transition-all" value={form.price??0} onChange={e=>setForm(s=>({...s,price:e.target.value}))} />
                        ) : Number(p.price||0).toFixed(2)}
                        <span> BDT</span>
                      </td>
                      <td className="text-gray-900">
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm w-20 text-right bg-gray-400 focus:ring-2 focus:ring-emerald-300 transition-all" value={form.stock??0} onChange={e=>setForm(s=>({...s,stock:e.target.value}))} />
                        ) : (p.stock ?? 0)}
                      </td>
                      <td  className="text-gray-900">{p.sellerEmail}</td>
                      <td>
                        <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!p.active}
                          onChange={(e) => toggleActive(p.id, e.target.checked)}
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-emerald-600 transition-colors duration-200"></div>
                        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                      </label>
                    </td>

                      <td className="text-right">
                        {editing===p.id ? (
                          <div className="join">
                            <button className="btn bg-emerald-600 border-emerald-600 text-white btn-sm join-item" onClick={save}>Save</button>
                            <button className="btn bg-red-500 text-white border-red-500 btn-sm join-item" onClick={cancelEdit}>Cancel</button>
                          </div>
                        ) : (
                          <div className="flex-justify-end space-x-1">
                            <button className="btn bg-white border-emerald-600 text-emerald-600 btn-sm  hover:bg-emerald-600 hover:text-white" onClick={()=>startEdit(p)}>Edit</button>
                            <button className="btn bg-white border-red-600 btn-sm  text-red-600" onClick={()=>del(p.id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
