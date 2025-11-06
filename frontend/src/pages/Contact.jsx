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
      setMsg("Thanks! Your message was sent.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      <Navbar role={localStorage.getItem("userRole") || ""} />
      <main className="flex-grow w-full max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Contact Us</h1>

        {msg && (
          <div className={`alert ${
            /thanks|sent|success/i.test(msg) ? "alert-success" :
            /fail|error/i.test(msg) ? "alert-error" : "alert-info"
          } mb-4`}>
            <span>{msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Name</span></label>
                <input
                  className="input input-bordered"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  className="input input-bordered"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Subject</span></label>
                <input
                  className="input input-bordered"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Message</span></label>
                <textarea
                  className="textarea textarea-bordered"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your message..."
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>

          {/* Info + Map */}
          <div className="space-y-4">
            <div className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Get in touch</h2>
                <ul className="space-y-2">
                  <li>Email: support@shopease.com</li>
                  <li>Phone: +880 0000000000</li>
                  <li>Address: SUST, Sylhet, Bangladesh</li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
              <div className="relative w-full h-64">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=1%20Grafton%20Street,%20Dublin,%20Ireland&t=&z=14&ie=UTF8&iwloc=B&output=embed"
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
