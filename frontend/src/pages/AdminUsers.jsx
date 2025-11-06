// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminListUsers, adminSetUserRole, adminDeleteUser } from "../services/admin";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListUsers(q);
      setUsers(res.data || []);
    } catch {
      setMsg("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try {
      await adminSetUserRole(id, role);
      setMsg("Role updated");
      load();
    } catch { setMsg("Failed to update role."); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await adminDeleteUser(id);
      setMsg("User deleted");
      load();
    } catch { setMsg("Failed to delete user."); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-5xl mx-auto p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Users</h1>
          <div className="flex gap-2">
            <input className="input input-bordered" placeholder="Search email" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn" onClick={load}>Search</button>
          </div>
        </div>
        {msg && <div className="alert alert-info mb-3"><span>{msg}</span></div>}
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body overflow-x-auto">
            {loading ? <div>Loading...</div> : (
              <table className="table table-zebra">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name || "—"}</td>
                      <td>{u.email}</td>
                      <td>
                        <select className="select select-bordered select-sm" value={u.role} onChange={e=>changeRole(u.id, e.target.value)}>
                          <option>BUYER</option><option>SELLER</option><option>ADMIN</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <button className="btn btn-error btn-sm" onClick={()=>deleteUser(u.id)}>Delete</button>
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
