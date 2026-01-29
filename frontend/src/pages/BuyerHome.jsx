import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getAllProducts } from "../services/productService";
import AddToCartWishlistButtons from "../components/AddToCartWishlistButtons";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/// Helper to get an icon based on category name
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toUpperCase();
  const iconClass = "w-8 h-8";

  // 1. ALL / Top Sold (Grid/List Icon)
  if (name === "ALL") return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
  
  // 2. MOBILE PHONE (Smartphone Icon) - Filled
  if (name.includes("MOBILE PHONE")) return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h10V5H7zm5 16a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );

  // 3. LAPTOP (Stroke Icon)
  if (name.includes("LAPTOP")) return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19c0 .552-.448 1-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1h4c.552 0 1 .448 1 1v4zM15 19h3c.552 0 1-.448 1-1v-4a1 1 0 00-1-1h-3c-.552 0-1 .448-1 1v4zM21 7H3a2 2 0 00-2 2v8a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2z" />
    </svg>
  );

  // 4. TABLET (Stroke Icon)
  if (name.includes("TABLET")) return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21h7a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7m0 0a2 2 0 100-4 2 2 0 000 4zm0 0h.01" />
    </svg>
  );

  // 5. MEN'S FASHION / CLOTHING (T-Shirt Icon)
  if (name.includes("FASHION") || name.includes("CLOTH") || name.includes("SHIRT")) return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21v-4a3 3 0 013-3h1a3 3 0 013 3v4M3 7l2-2 2 2M21 7l-2-2-2 2M6 10h12a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6a1 1 0 011-1z" />
    </svg>
  );
  
  // 6. ELECTRONICS (General Plug Icon) - Catches general electronics
  if (name.includes("ELECTRONIC")) return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  // 7. Default icon (Box/Container Icon)
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
    </svg>
  );
};

// Function to render star rating display
const renderStars = (rating) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  for (let i = 0; i < 5; i++) {
    let fillPercent = 0;
    if (i + 1 <= Math.floor(roundedRating)) {
      fillPercent = 100; // Full star
    } else if (i < roundedRating) {
      fillPercent = (roundedRating - i) * 100; // Partial star
    }

    stars.push(
      <div key={i} className="relative inline-block w-4 h-4 mr-0.5">
        {/* Gray Background Star */}
        <svg
          className="w-full h-full text-gray-300 absolute top-0 left-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Yellow Foreground Star (Cropped) */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${fillPercent}%` }}
        >
          <svg
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    );
  }
  return <div className="flex items-center">{stars}</div>;
};


function BuyerHome() {
  const [products, setProducts] = useState([]); // Full product list for category generation
  const [topProducts, setTopProducts] = useState([]); // Curated list for grid display
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("RELEVANCE");
  const [viewType, setViewType] = useState("TOP_SELLERS"); // Default to Top Sellers

  // Function to handle product data fetching
  const fetchData = useCallback(async (selectedCategory = category) => {
    setLoading(true);
    try {
      //  Fetch ALL products list 
      const allRes = await getAllProducts();
      const allProducts = Array.isArray(allRes.data) ? allRes.data : [];
      setProducts(allProducts); 
      
      //  Fetch the curated list for the grid display
      let curatedParams = {};
      if (selectedCategory === "ALL" && viewType) {
        curatedParams.view = viewType; 
      } else if (selectedCategory !== "ALL") {
        curatedParams.category = selectedCategory;
      }
      
    
      const curatedRes = await getAllProducts(curatedParams);
      setTopProducts(Array.isArray(curatedRes.data) ? curatedRes.data : allProducts.slice(0, 12)); 
      
      if (!allProducts.length) setMessage("No products found.");

    } catch (e) {
      console.error("Failed to load products:", e);
      setMessage("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [viewType, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.category && set.add(p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = topProducts;
    
    // Apply search filter
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(t));
    }
    
    // Apply sort filter
    if (sort === "PRICE_ASC") list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "PRICE_DESC") list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    
    return list;
  }, [topProducts, q, sort]);

  const SkeletonCard = () => (
    <div className="card bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse overflow-hidden">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role={sessionStorage.getItem("userRole") || "BUYER"} /> 
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center md:text-left">
          <h1 className="text-3xl sm:text-5xl font-bold">Welcome to Buyer Dashboard</h1>
          <p className="mt-4 text-lg opacity-90 max-w-xl">
            Browse our exclusive collection. Add items to your cart and place your order today.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 flex-grow w-full">
        
        {/* Category Highlights Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setQ(""); 
                  fetchData(cat); 
                }}
                className={`flex flex-col items-center justify-center min-w-[130px] h-[130px] p-4 rounded-xl border transition-all duration-200 
                  ${category === cat 
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-sm"
                  }`}
              >
                <div className="mb-2">
                  {getCategoryIcon(cat)}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide">{cat=="ALL"?" top sold":cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Header + Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-emerald-600">
             {category === "ALL" ? "🔥 Best-Selling Products" : `${category} Products`}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="form-control w-full sm:w-auto">
              <div className="bg-white border border-emerald-600 input input-bordered flex items-center gap-2 focus-within:ring focus-within:ring-green-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  className="grow outline-none bg-transparent placeholder-emerald-600 text-gray-800"
                  placeholder="Search products"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>

            {/* Sort */}
            <select
              className="select select-bordered w-full sm:w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="RELEVANCE">Sort: Relevance</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : message && !filtered.length ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">{message}</p>
            <button
              className="btn btn-primary hover:bg-green-600 transition"
              onClick={() => { setQ(""); setCategory("ALL"); setSort("RELEVANCE"); fetchData("ALL"); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => {
              const price = Number(prod.price || 0).toFixed(2);
              const inStock = prod.stock == null ? true : prod.stock > 0;
              const avgRating = prod.avgRating || 0; 
              const totalReviews = prod.totalReviews || 0;

              return (
                <div 
                  key={prod.id} 
                  className="card bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
                >
                  <Link to={`/products/${prod.id}`}>
                    <figure className="bg-gray-200 h-48">
                      {prod.imageUrl ? (
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 text-gray-500" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}
                    </figure>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${prod.id}`}>
                        <h3 className="font-semibold line-clamp-1 text-gray-800">{prod.name}</h3>
                    </Link>
                    
                    {prod.category && <p className="text-xs text-gray-500 mt-0.5">{prod.category}</p>}
                    
                    {/* Price and Stock Status */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xl font-bold text-red-500">৳ {price}</span>
                      
                      {/* STOCK STATUS */}
                      <span 
                        className={`badge text-xs font-semibold ${inStock ? "badge-success text-white" : "badge-error text-white"}`}
                      >
                        {inStock ? "In stock" : "Out of stock"}
                      </span>
                    </div>
                    
                    {/* Rating Section */}
                    <div className="flex items-center mt-1 gap-2">
                      {renderStars(avgRating)}
                      
                      {/* RATING SCORE */}
                      <span className="text-sm font-bold text-red-500">
                          {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
                      </span>                      
                      
                      {/* REVIEW COUNT */}
                      <span className="text-xs text-gray-500">({totalReviews})</span>
                    </div>
                    
                    <div className="mt-3">
                      <AddToCartWishlistButtons product={prod} size="sm" layout="row" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default BuyerHome;