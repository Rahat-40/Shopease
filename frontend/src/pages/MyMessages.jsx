import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyMessages } from "../services/contact";
import { Link } from "react-router-dom";

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getMyMessages();
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
      <Navbar role={sessionStorage.getItem("userRole")} />
      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-emerald-600 mb-4">My Support Tickets</h1>
        {messages.length === 0 && <p>No tickets found.</p>}
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <Link
              key={m.id}
              to={`/messages/${m.id}`}
              className="p-4 bg-white rounded shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-red-500">{m.subject}</div>
                <div className="text-emerald-700 text-sm">Status: {m.status}</div>
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
