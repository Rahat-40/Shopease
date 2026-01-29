import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { adminGetAllMessages } from "../services/contact";
import { Link } from "react-router-dom";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // load  all message function
  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await adminGetAllMessages("");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-emerald-600 mb-4">Support Tickets</h1>
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <Link
              key={m.id}
              to={`/admin/messages/${m.id}`}
              className="p-5 bg-white rounded shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-red-600">{m.subject}</div>
                <div className="text-gray-600 text-sm">From: {m.userEmail}</div>
                <div className="text-emerald-600 text-sm">Status: {m.status}</div>
              </div>
              <div className="text-gray-800 text-sm">{new Date(m.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
