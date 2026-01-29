import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar({ role }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const token = sessionStorage.getItem("token");
  const userEmail = sessionStorage.getItem("userEmail");
  const userRole = sessionStorage.getItem("userRole");
  const username = userEmail ? userEmail.substring(0, userEmail.indexOf("@")) : "User";

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    navigate("/");
  };

// Helper to highlight active link
  const isActive = (path) => {
    const isRootDashboard = ["/buyer", "/seller", "/admin"].includes(path);

    // 1. Exact Match (Always highest priority)
    if (pathname === path) return "text-emerald-600 font-bold";


    // If we are on the generic product detail page (/products/123), keep the specific 
    // Products list links (/buyer/products, /seller/products, /products) active.
    if ((path.endsWith("/products") || path === "/products") && pathname.startsWith("/products/")) {
      return "text-emerald-600 font-bold";
    }


    // If the Navbar link is "/cart" but the URL starts with "/checkout"
    if (path === "/cart" && pathname.startsWith("/checkout")) {
      return "text-emerald-600 font-bold";
    }


    // We strictly exclude root dashboards (/buyer, /seller, /admin) from this check 
    // to prevent the Home link from being active everywhere.
    if (!isRootDashboard && pathname.startsWith(path + "/")) {
      return "text-emerald-600 font-bold";
    }

    // Default style
    return "text-gray-700 hover:text-emerald-600";
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-50">

      {/* Logo */}
      {!role && <Link to="/" className="text-2xl font-bold text-emerald-600">ShopEase</Link>}
      {role === "BUYER" && <Link to="/buyer" className="text-2xl font-bold text-emerald-600">ShopEase</Link>}
      {role === "SELLER" && <Link to="/seller" className="text-2xl font-bold text-emerald-600">ShopEase</Link>}
      {role === "ADMIN" && <Link to="/admin" className="text-2xl font-bold text-emerald-600">ShopEase</Link>}

      {/* Nav Items */}
      <ul className="flex space-x-6 text-sm font-semibold">
        {!role && (
          <>
            <li><Link to="/products" className={isActive("/products")}>Products</Link></li>
            <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>
          </>
        )}

        {role === "BUYER" && (
          <>
            <li><Link to="/buyer" className={isActive("/buyer")}>Home</Link></li>
            <li><Link to="/buyer/products" className={isActive("/buyer/products")}>Products</Link></li>
            <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>
            <li><Link to="/cart" className={isActive("/cart")}>Cart</Link></li>
            <li><Link to="/wishlist" className={isActive("/wishlist")}>Wishlist</Link></li>
            <li><Link to="/buyer/orders" className={isActive("/buyer/orders")}>Orders</Link></li>
            <li><Link to="/messages" className={isActive("/messages")}>Messages</Link></li>
          </>
        )}

        {role === "SELLER" && (
          <>
            <li><Link to="/seller" className={isActive("/seller")}>Dashboard</Link></li>
            <li><Link to="/seller/products" className={isActive("/seller/products")}>My Products</Link></li>
            <li><Link to="/seller/products/new" className={isActive("/seller/products/new")}>Add Product</Link></li>
            <li><Link to="/seller/orders" className={isActive("/seller/orders")}>Orders</Link></li>
            <li><Link to="/contact" className={isActive("/contact")}>Contact</Link></li>
            <li><Link to="/messages" className={isActive("/messages")}>Message</Link></li>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <li><Link to="/admin" className={isActive("/admin")}>Dashboard</Link></li>
            <li><Link to="/admin/users" className={isActive("/admin/users")}>Users</Link></li>
            <li><Link to="/admin/messages" className={isActive("/admin/messages")}>Messages</Link></li>
          </>
        )}
      </ul>

      {/* Right Side: Auth / Profile */}
      <div className="flex items-center gap-4">

        {/* Guest */}
        {!token && !role && (
          <>
            <Link
              to="/login"
              className="bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-emerald-600 text-white border border-emerald-600 hover:bg-white hover:text-emerald-600 px-3 py-1 rounded transition"
            >
              Register
            </Link>
          </>
        )}

        {token && (
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">
            Hi, <span className="text-emerald-600">{username}</span> !
          </span>
        )}

        {/* Logged in: Profile dropdown */}
        {token && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-base-200 text-white 
                              flex items-center justify-center font-bold text-lg leading-none select-none">
                {(userEmail?.charAt(0) || "U").toUpperCase()}
              </div>
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white shadow-xl rounded-lg border w-56 p-2 mt-2"
            >
              <li className="text-center py-2 border-b">
                <p className="font-semibold truncate text-emerald-600">{userEmail}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </li>
{/* 
              <li><Link to="/profile" className="text-gray-700">Profile</Link></li>
              <li><Link to="/settings" className="text-gray-700">Settings</Link></li> */}
              <li>
                <button onClick={handleLogout} className="text-red-600 font-semibold w-full text-left">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
