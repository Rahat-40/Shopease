import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (!form.subject.trim()) return "Subject is required.";
    if (!form.message.trim()) return "Message is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setMsg(v); return; }
    try {
      setLoading(true);
      setMsg("");
      await API.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setMsg("✅ Thanks! Your message was sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setMsg(err?.response?.data?.message || "❌ Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role={sessionStorage.getItem("userRole") || ""} />

      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">
          Contact Us
        </h1>

        {msg && (
          <div
            className={`alert mb-6 ${
              /thanks|sent|success/i.test(msg)
                ? "alert-success bg-emerald-100 text-emerald-800"
                : /fail|error/i.test(msg)
                ? "alert-error bg-red-100 text-red-800"
                : "alert-info bg-blue-100 text-blue-800"
            }`}
          >
            <span>{msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition duration-300"
          >
            <div className="card-body gap-4">
              <div className="form-control space-x-1">
                <label className="label mb-1">
                  <span className="label-text font-semibold text-gray-700">
                    Name
                  </span>
                </label>
                <input
                  className="input input-bordered bg-gray-300 text-gray-800 font-bold  focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-control space-x-1">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    Email
                  </span>
                </label>
                <input
                  className="input input-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-control space-x-1">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    Subject
                  </span>
                </label>
                <input
                  className="input input-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-control space-x-1">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">
                    Message
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered  bg-gray-300 text-gray-800 font-bold  focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 "
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your message..."
                />
              </div>

              <button
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>

          {/* Info + Map */}
          <div className="space-y-6">
            <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-emerald-700">Get in Touch</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <strong>Email:</strong> support@shopease.com
                  </li>
                  <li>
                    <strong>Phone:</strong> +880 0000000000
                  </li>
                  <li>
                    <strong>Address:</strong> SUST, Sylhet, Bangladesh
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-xl overflow-hidden">
              <div className="relative w-full h-64">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Shahjalal%20University%20of%20Science%20%26%20Technology,%20Sylhet,%20Bangladesh&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                  allowFullScreen
                  loading="lazy"
                  title="ShopEase Location"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
