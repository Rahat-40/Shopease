import React, { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { getProductReviews } from "../services/reviewService";
import shopeaseHeroImage from "../assets/shopease_hero2.png";

// Helper to render stars 
const renderStars = (rating) => {
    const stars = [];
    // Ensure rating is rounded to the nearest 0.5 for partial stars to work correctly
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 0; i < 5; i++) {
        let fillPercent = 0;

        if (i + 1 <= Math.floor(roundedRating)) fillPercent = 100;
        else if (i < roundedRating) fillPercent = (roundedRating - i) * 100;

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

                {/* Yellow Foreground Star */}
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

//  Helper to get an icon based on category name with specific paths
const getCategoryIcon = (categoryName) => {
    const name = categoryName.toUpperCase();

    // 1. General/Top Rated
    if (name === "ALL") 
        // Hamburger/List Icon
        return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;

    // 2. Mobile Phone, Tablet
    if (name.includes("MOBILE PHONE")) 
        // Mobile Phone/Device Icon
        return <svg viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="16" height="16" id="icon-bound" fill="none"></rect> <path d="M11.5,0h-7C3.675,0,3,0.675,3,1.5v13C3,15.325,3.675,16,4.5,16h7c0.825,0,1.5-0.675,1.5-1.5v-13C13,0.675,12.325,0,11.5,0z M8,15c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S8.553,15,8,15z M12,12H4V2h8V12z"></path> </g></svg>

        if (name.includes("TABLET")) 
        // tablet
        return <svg fill="#000000" viewBox="-4 0 32 32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.000,32.000 L3.000,32.000 C1.346,32.000 0.000,30.654 0.000,29.000 L0.000,3.000 C0.000,1.346 1.346,-0.000 3.000,-0.000 L21.000,-0.000 C22.654,-0.000 24.000,1.346 24.000,3.000 L24.000,29.000 C24.000,30.654 22.654,32.000 21.000,32.000 ZM22.000,3.000 C22.000,2.449 21.552,2.000 21.000,2.000 L3.000,2.000 C2.448,2.000 2.000,2.449 2.000,3.000 L2.000,29.000 C2.000,29.551 2.448,30.000 3.000,30.000 L21.000,30.000 C21.552,30.000 22.000,29.551 22.000,29.000 L22.000,3.000 ZM14.000,5.000 L10.000,5.000 C9.447,5.000 9.000,4.552 9.000,4.000 C9.000,3.448 9.447,3.000 10.000,3.000 L14.000,3.000 C14.553,3.000 15.000,3.448 15.000,4.000 C15.000,4.552 14.553,5.000 14.000,5.000 ZM12.000,25.000 C13.102,25.000 14.000,25.897 14.000,27.000 C14.000,28.103 13.102,29.000 12.000,29.000 C10.897,29.000 10.000,28.103 10.000,27.000 C10.000,25.897 10.897,25.000 12.000,25.000 Z"></path> </g></svg>

    // 3. Laptop
    if (name.includes("LAPTOP")) 
        // Laptop/Computer Icon
        return <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 18H14M7.20003 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V11.8C20 12.9201 20 13.4802 19.782 13.908C19.5903 14.2843 19.2843 14.5903 18.908 14.782C18.4802 15 17.9201 15 16.8 15H7.20003C6.07992 15 5.51987 15 5.09205 14.782C4.71572 14.5903 4.40976 14.2843 4.21801 13.908C4.00003 13.4802 4.00003 12.9201 4.00003 11.8V6.2C4.00003 5.0799 4.00003 4.51984 4.21801 4.09202C4.40976 3.71569 4.71572 3.40973 5.09205 3.21799C5.51987 3 6.07992 3 7.20003 3ZM4.58888 21H19.4112C20.2684 21 20.697 21 20.9551 20.8195C21.1805 20.6618 21.3311 20.4183 21.3713 20.1462C21.4173 19.8345 21.2256 19.4512 20.8423 18.6845L20.3267 17.6534C19.8451 16.6902 19.6043 16.2086 19.2451 15.8567C18.9274 15.5456 18.5445 15.309 18.1241 15.164C17.6488 15 17.1103 15 16.0335 15H7.96659C6.88972 15 6.35128 15 5.87592 15.164C5.45554 15.309 5.07266 15.5456 4.75497 15.8567C4.39573 16.2086 4.15493 16.6902 3.67334 17.6534L3.1578 18.6845C2.77444 19.4512 2.58276 19.8345 2.6288 20.1462C2.669 20.4183 2.81952 20.6618 3.04492 20.8195C3.30306 21 3.73166 21 4.58888 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>

    // 4. Men's Fashion (Clothing, Shirt, etc.) - FIXED SYNTAX AND USING SUIT ICON
    if (name.includes("FASHION") || name.includes("CLOTH") || name.includes("SHIRT")) { 
        // Suit/Jacket Icon Path (Clearer for 'Fashion')
        return <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000000" d="M133.3 33.41L77.89 47.25 34.6 148.3l33.29 22.2 27.46-54.9 17.05 4.9-15.07 150.1H245.2l9.2-87.9.9-8.1h4.5l-5.4-54.1 17.1-4.9 27.4 54.9 33.3-22.2-43.3-101.05-55.4-13.84c-5.5 3.87-12.2 6.21-19.5 7.95-9.4 2.21-20 3.24-30.6 3.24-10.6 0-21.2-1.03-30.6-3.24-7.3-1.74-14-4.07-19.5-7.95zM271.5 192.6l-1.5 14h178.8l-1.5-14zm-3.4 32l-26.7 254h62.7l46.5-216.9h17.6l46.5 216.9h62.7l-26.7-254z"></path></g></svg>
    }

    // 5. Electronics (General) - Catches anything remaining like "Headphones" or "Camera"
    if (name.includes("ELECTRONIC")) 
        // Lightning Bolt/Flash Icon
        return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

    // Fallback Icon (General Item/Box Icon)
    return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 10.5h13a1 1 0 011 1v6a1 1 0 01-1 1h-13a1 1 0 01-1-1v-6a1 1 0 011-1zM4 10h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" /></svg>;
};

function ProductCard({ p, onRequireAuth }) {
    const token = sessionStorage.getItem("token");

    const add = () =>
        !token ? onRequireAuth() : console.log("add-to-cart", p.id);

    return (

        //  CARD DESIGN 

        <div className="card bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition duration-300">
            <Link to={`/products/${p.id}`}>
                <figure className="h-48 bg-gray-300 overflow-hidden">
                    {p.imageUrl ? (
                        <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            No Image
                        </div>
                    )}
                </figure>
            </Link>

            <div className="card-body">
                <Link to={`/products/${p.id}`}>
                    <h3 className="card-title text-base-300">{p.name}</h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2">{p.category}</p>

                {/*  RATING BLOCK */}
                <div className="flex items-center mt-1 gap-2">
                    {renderStars(p.avgRating)}
                    <span className="text-sm font-bold text-red-500">
                        {p.avgRating > 0 ? p.avgRating.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-gray-500">({p.totalReviews})</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-xl text-red-600">
                        ৳{Number(p.price || 0).toFixed(2)}
                    </span>
                    <span
                        className={`badge ${
                            p.stock ? "badge-success" : "badge-ghost"
                        }`}
                    >
                        {p.stock ? "In stock" : "Out of stock"}
                    </span>
                </div>

                <div className="card-actions justify-between mt-2">
                    <Link
                        className="btn btn-sm bg-emerald-600 border-emerald-600 hover:bg-white hover:text-emerald-600"
                        to={`/products/${p.id}`}
                    >
                        Details
                    </Link>
                    <div className="join">
                        <button
                            className="btn btn-sm join-item bg-white border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                            onClick={add}
                            disabled={!p.stock}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [topProducts, setTopProducts] = useState([]); 
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("ALL");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("RELEVANCE");
    const navigate = useNavigate();

    const onRequireAuth = () => {
        navigate("/login");
    };

    //Logic to fetch all products, calculate ratings, sort, and slice to top 10
    const fetchData = useCallback(async (selectedCategory = category) => {
        setLoading(true);
        try {
            const res = await API.get("/products");
            const allProducts = Array.isArray(res.data) ? res.data : [];
            setProducts(allProducts); 

            //  Calculate ratings for ALL products
            const allProductsWithRatings = await Promise.all(
                allProducts.map(async (p) => {
                    try {
                        const rev = await getProductReviews(p.id);
                        const reviews = rev.data || [];
                        const avgRating = reviews.length
                            ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
                            : 0;

                        return { ...p, avgRating, totalReviews: reviews.length };
                    } catch {
                        return { ...p, avgRating: 0, totalReviews: 0 };
                    }
                })
            );

            //  Apply Category Filter
            let filtered = selectedCategory === "ALL" 
                ? allProductsWithRatings 
                : allProductsWithRatings.filter(p => p.category === selectedCategory);
            
            //  Sort by Rating (Descending) only when 'ALL' is selected or 'RELEVANCE' is the sort type
            if (selectedCategory === "ALL" || sort === "RELEVANCE") {
                 // Sort by average rating (highest rating first)
                 filtered.sort((a, b) => b.avgRating - a.avgRating);
            }
            
            // Limit to the Top 10 Products
            filtered = filtered.slice(0, 10); 
            
            setTopProducts(filtered); 

        } catch (e) {
            console.error("Failed to fetch products:", e);
            setTopProducts([]);
        } finally {
            setLoading(false);
        }
    }, [category, sort]); // Added 'sort' as a dependency

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // UseMemo to generate the unique list of categories (
    const categories = useMemo(() => {
        const set = new Set();
        products.forEach(p => p.category && set.add(p.category));
        return ["ALL", ...Array.from(set)];
    }, [products]);

    // UseMemo to apply client-side search and sort to the displayed list
    const filteredAndSortedItems = useMemo(() => {
        let list = topProducts;
        
        // Apply search filter
        if (q.trim()) { 
            const t = q.toLowerCase(); 
            list = list.filter(p => (p.name || "").toLowerCase().includes(t)); 
        }
        
        // Apply Price sort filter (Note: Rating sort is handled in fetchData for the initial list)
        if (sort === "PRICE_ASC") list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        if (sort === "PRICE_DESC") list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        
        return list;
    }, [topProducts, q, sort]);

    // Handler for category button clicks
    const handleCategoryClick = (cat) => {
        setCategory(cat);
        setQ(""); // Clear search when changing category
        fetchData(cat);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

{/* Hero Section (Design Retained) */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-gray-200">
                {/* Added flex classes for layout */}
                <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Left: Text Content */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold">Welcome to ShopEase</h1>
                        <p className="mt-3 opacity-90">
                            Discover top-rated products with zero effort. Browse freely, find your favorites, and log in for our quickest checkout experience. 
                            
                        </p>
                        <div className="mt-6 flex gap-2 justify-center md:justify-start">
                            <button
                                className="btn bg-white text-emerald-600 border border-white hover:bg-emerald-600 hover:text-white"
                                onClick={() => navigate("/register")}
                            >
                                Get Started
                            </button>
                            <button
                                className="btn bg-transparent border border-white hover:bg-white hover:text-emerald-600"
                                onClick={() => navigate("/products")}
                            >
                                Explore Products
                            </button>
                        </div>
                    </div>

                    {/*  Right Side Image/Illustration */}
                    <div className="md:w-1/2 flex justify-center md:justify-end">
                        {/* Replace 'shopease-hero-image.png' with your actual image path */}
                        <img 
                            src={shopeaseHeroImage}            
                            alt="ShopEase Shopping"
                            className="max-w-xs md:max-w-sm lg:max-w-md h-auto rounded-lg shadow-l" // Added styling
                        />
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
                
                {/* Categories Scroller */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Shop by Category</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`flex flex-col items-center justify-center min-w-[130px] h-[130px] p-4 rounded-xl border transition-all duration-200 
                                    ${category === cat 
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-emerald-100"
                                    }`}
                            >
                                {getCategoryIcon(cat)}
                                <span className="text-xs font-semibold mt-2">{cat === "ALL" ? "Top Rated" : cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Sort Controls */}
                <div className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-4 items-center">
                    <h2 className="text-2xl font-semibold text-emerald-600">
                        {category === "ALL" ? "⭐ Top 10 Rated Products" : `${category} Products`}
                    </h2>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                        
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
                        <select 
                            className="select select-bordered w-full sm:w-auto" 
                            value={sort} 
                            onChange={e => setSort(e.target.value)}
                        >
                            {/* RELEVANCE is now Rating-based for the 'ALL' category view */}
                            <option value="RELEVANCE">Sort: Relevance (Rating)</option> 
                            <option value="PRICE_ASC">Price: Low to High</option>
                            <option value="PRICE_DESC">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                
                {/* Product Grid (Feature 2: Displaying the filtered/top list) */}
                {loading ? (
                    <div className="text-center py-16">Loading...</div>
                ) : filteredAndSortedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredAndSortedItems.map((p) => (
                            <ProductCard
                                key={p.id}
                                p={p}
                                onRequireAuth={onRequireAuth}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">No products found.</div>
                )}
            </main>

            <Footer />
        </div>
    );
}