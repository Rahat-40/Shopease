import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { addProduct } from "../services/productService";
import API from "../services/api";

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    imageUrl: "",
    active: true,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const isValidUrl = (u) => {
    try { new URL(u, window.location.origin); return true; } catch { return false; }
  };
  const handleImageUrlBlur = () => {
    if (form.imageUrl && isValidUrl(form.imageUrl)) setImagePreview(form.imageUrl);
  };

  const validate = () => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category.trim()) return "Category is required.";
    if (!form.description.trim()) return "Description is required.";
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (Number.isNaN(price) || price < 0) return "Price must be a non-negative number.";
    if (Number.isNaN(stock) || stock < 0) return "Stock must be a non-negative number.";
    return "";
  };

  const handleLocalUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { setMsg("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg("Max size 10MB."); return; }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await API.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.url; // e.g., /images/uuid.jpg
      setForm((s) => ({ ...s, imageUrl: url }));
      setImagePreview(url);
      setMsg("Image uploaded.");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setMsg(v); return; }
    try {
      setLoading(true); setMsg("");
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        category: form.category.trim(),
        active: !!form.active,
      };
      await addProduct(payload);
      setMsg("Product created successfully!");
      setTimeout(() => navigate("/seller/products"), 800);
    } catch {
      setMsg("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="SELLER" />
      <main className="flex-grow max-w-3xl mx-auto p-6 w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-emerald-600">Add Product</h2>
          <Link to="/seller/products" className="btn btn-outline border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white btn-sm">My Products</Link>
        </div>

        {msg && (
          <div className={`alert ${
            msg.toLowerCase().includes("success")
              ? "alert-success"
              : msg.toLowerCase().includes("fail")
              ? "alert-error"
              : "alert-info"
          } mb-4`}>
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control md:col-span-2 space-x-2">
              <label className="label"><span className="label-text font-bold text-gray-800">Product name</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered font-bold bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Product name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold text-gray-800">Price (BDT)</span></label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input input-bordered bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Product price"
                inputMode="decimal"
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold text-gray-800">Stock</span></label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="input input-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                inputMode="numeric"
                placeholder="Product Stock"
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold text-gray-800">Category</span></label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input input-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="e.g., Electronics"
                required
              />
            </div>

            {/* Description textarea */}
            <div className="form-control md:col-span-2 space-x-2">
              <label className="label"><span className="label-text font-bold text-gray-800">Description</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="textarea textarea-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Write a concise product description"
                rows={4}
                required
              />
            </div>

            <div className="form-control md:col-span-2 space-x-2">
              <label className="label"><span className="label-text font-bold text-gray-800">Image URL</span></label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                onBlur={handleImageUrlBlur}
                className="input input-bordered  bg-gray-300 text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Paste a link or use upload below"
              />
            </div>

            <div className="form-control md:col-span-2 space-x-2">
              <label className="label"><span className="label-text font-bold text-gray-800">Upload from computer</span></label>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full max-w-xs  bg-gray-300 text-gray-800 font-bold"
                onChange={handleLocalUpload}
                disabled={uploading}
              />
              {uploading && <span className="text-xs mt-1">Uploading...</span>}
            </div> 

            <div className="md:col-span-2">
              <div className="label"><span className="label-text">Preview</span></div>
              <div className="w-full h-56 rounded-lg overflow-hidden flex items-center justify-center  bg-gray-300 text-gray-800 font-bold">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview("/images/placeholder.jpg")}
                  />
                ) : (
                  <span className="font-bold text-gray-800 text-sm">No image</span>
                )}
              </div>
            </div>

            <div className="form-control md:col-span-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}                  className="toggle border-emerald-600 bg-gray-500 checked:bg-emerald-600 checked:border-emerald-700"

                />
                <span className="label-text">Active (visible in public catalog)</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading} className="btn bg-emerald-600 border-emerald-600 hover:bg-emerald-800 w-full">
                {loading ? "Creating..." : "Create product"}
              </button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default AddProduct;
