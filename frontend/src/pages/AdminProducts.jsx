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
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Products</h1>
          <div className="flex gap-2">
            <input className="input input-bordered" placeholder="Search name" value={filters.q} onChange={e=>setFilters(f=>({...f, q:e.target.value}))} />
            <input className="input input-bordered" placeholder="Filter category" value={filters.category} onChange={e=>setFilters(f=>({...f, category:e.target.value}))} />
            <button className="btn" onClick={load}>Apply</button>
          </div>
        </div>
        {msg && <div className="alert alert-info mb-3"><span>{msg}</span></div>}
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body overflow-x-auto">
            {loading ? <div>Loading...</div> : (
              <table className="table table-zebra">
                <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Seller</th><th>Active</th><th></th></tr></thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm" value={form.name||""} onChange={e=>setForm(s=>({...s,name:e.target.value}))} />
                        ) : p.name}
                      </td>
                      <td>
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm" value={form.category||""} onChange={e=>setForm(s=>({...s,category:e.target.value}))} />
                        ) : (p.category || "—")}
                      </td>
                      <td>
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm w-24 text-right" value={form.price??0} onChange={e=>setForm(s=>({...s,price:e.target.value}))} />
                        ) : Number(p.price||0).toFixed(2)}
                      </td>
                      <td>
                        {editing===p.id ? (
                          <input className="input input-bordered input-sm w-20 text-right" value={form.stock??0} onChange={e=>setForm(s=>({...s,stock:e.target.value}))} />
                        ) : (p.stock ?? 0)}
                      </td>
                      <td>{p.sellerEmail}</td>
                      <td>
                        <input type="checkbox" className="toggle toggle-primary toggle-sm"
                          checked={!!p.active}
                          onChange={e=>toggleActive(p.id, e.target.checked)} />
                      </td>
                      <td className="text-right">
                        {editing===p.id ? (
                          <div className="join">
                            <button className="btn btn-sm join-item" onClick={save}>Save</button>
                            <button className="btn btn-ghost btn-sm join-item" onClick={cancelEdit}>Cancel</button>
                          </div>
                        ) : (
                          <div className="join">
                            <button className="btn btn-ghost btn-sm join-item" onClick={()=>startEdit(p)}>Edit</button>
                            <button className="btn btn-error btn-sm join-item" onClick={()=>del(p.id)}>Delete</button>
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
