import { Link, useNavigate } from "react-router-dom";

function Navbar({ role }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 text-gray-700 p-4 flex justify-between items-center sticky top-0 z-50 ">
      {/* Logo */}
      {/* <Link to="/" className="text-2xl font-bold text-emerald-600">ShopEase</Link> */}
        {!role && (
          <>
             <Link to="/" className="text-2xl font-bold text-emerald-600">ShopEase</Link>
          </>
        )}

        {role === "BUYER" && (
          <>
             <Link to="/buyer" className="text-2xl font-bold text-emerald-600">ShopEase</Link>
          </>
        )}

        {role === "SELLER" && (
          <>
             <Link to="/seller" className="text-2xl font-bold text-emerald-600">ShopEase</Link>
          </>
        )}

        {role === "ADMIN" && (
          <>
             <Link to="/admin" className="text-2xl font-bold text-emerald-600">ShopEase</Link>
          </>
        )}

      {/* Nav Links */}
      <ul className="flex space-x-6 text-sm font-semibold">
        {!role && (
          <>
            <li><Link to="/products" className="hover:text-emerald-600">Products</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-600">Contact</Link></li>
          </>
        )}

        {role === "BUYER" && (
          <>
            <li><Link to="/buyer" className="hover:text-emerald-600">Home</Link></li>
            <li><Link to="/buyer/products" className="hover:text-emerald-600">Products</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-600">Contact</Link></li>
            <li><Link to="/cart" className="hover:text-emerald-600">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-emerald-600">Wishlist</Link></li>
            <li><Link to="/buyer/orders" className="hover:text-emerald-600">My Orders</Link></li>
          </>
        )}

        {role === "SELLER" && (
          <>
            <li><Link to="/seller" className="hover:text-emerald-600">Home</Link></li>
            <li><Link to="/seller/products" className="hover:text-emerald-600">My Products</Link></li>
            <li><Link to="/seller/products/new" className="hover:text-emerald-600">Add Product</Link></li>
            <li><Link to="/seller/orders" className="hover:text-emerald-600">Orders</Link></li>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <li><Link to="/admin" className="hover:text-emerald-600">Dashboard</Link></li>
            <li><Link to="/admin/users" className="hover:text-emerald-600">Users</Link></li>
            <li><Link to="/admin/reports" className="hover:text-emerald-600">Reports</Link></li>
          </>
        )}
      </ul>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2">
        {!token ? (
          !role && (
            <>
              <Link
                to="/login"
                className="bg-white text-emerald-600 border border-emerald-600 outline-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded  transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-emerald-600 bg-emerald-600 hover:bg-white hover:text-emerald-600 px-3 py-1 rounded text-white transition"
              >
                Register
              </Link>
            </>
          )
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
