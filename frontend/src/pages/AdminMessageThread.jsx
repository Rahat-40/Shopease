import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { adminGetMessageThread, adminReplyMessage } from "../services/contact";

export default function AdminMessageThread() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  //  open a thread for message
  const loadThread = async () => {
    setLoading(true);
    try {
      const res = await adminGetMessageThread(id);
      setThread(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   // handle message reply
  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      await adminReplyMessage(id, reply);
      setReply("");
      loadThread();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadThread(); }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!thread) return <div className="p-6 text-red-600">Message not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="ADMIN" />
      {/** manage main section */}
      <main className="flex-grow max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-emerald-600 mb-4">{thread.subject}</h1>
        <div className="mb-4 p-4 bg-white rounded shadow">
          <div className="text-gray-800">{thread.message}</div>
          {thread.replies.map((r) => (
            <div key={r.id} className="mt-2 p-2 bg-gray-100 rounded">
              <strong className="text-gray-800">{r.responderEmail}</strong> <span className="text-gray-500 text-sm">({new Date(r.createdAt).toLocaleString()})</span>
              <div className="text-gray-800">{r.body}</div>
            </div>
          ))}
        </div>
          {/** reply text area */}
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="w-full p-2 border border-emerald-600 rounded mb-2 bg-gray-200 text-gray-800"
        />
        <button onClick={sendReply} className="btn bg-emerald-600 text-white border-emerald-600">Send Reply</button>
      </main>
      <Footer />
    </div>
  );
}
