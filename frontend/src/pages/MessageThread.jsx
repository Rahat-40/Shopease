import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { getMessageThread } from "../services/contact";

export default function MessageThread() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadThread = async () => {
    setLoading(true);
    try {
      const res = await getMessageThread(id);
      setThread(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadThread(); }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!thread) return <div className="p-6 text-red-600">Message not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={sessionStorage.getItem("userRole")} />
      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-emerald-600 mb-4">{thread.subject}</h1>
        <div className="mb-4 text-gray-700">Message from {thread.name} ({thread.userEmail})</div>
        <div className="mb-4 p-4 bg-white rounded shadow-xl hover:shadow-2xl">
          <div className="text-gray-800">{thread.message}</div>
          {thread.replies.map((r) => (
            <div key={r.id} className="mt-2 p-2 bg-gray-100 rounded">
              <strong className="text-emerald-600">{r.responderEmail}</strong> <span className="text-gray-800 text-sm">({new Date(r.createdAt).toLocaleString()})</span>
              <div className="text-gray-800">{r.body}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
