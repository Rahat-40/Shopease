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
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">

      {/* Shopease Logo */}
      <Link to="/" className="text-xl font-bold">Shopease</Link>
      
     
      <ul className="flex space-x-6">

      {/* Public navber*/}

        {!role && (
          <>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </>
        )}

      {/* buyer navber */}
        {role === "BUYER" && (
          <>
            <li><Link to="/buyer">Home</Link></li>
            <li><Link to="/buyer/products">Products</Link></li>
            <li><Link to="/buyer/contact">Contact</Link></li>
            <li><Link to="/cart">Cart</Link></li>           {/* Added Cart */}
            <li><Link to="/wishlist">Wishlist</Link></li>   {/* Added Wishlist */}
            <li><Link to="/buyer/orders">My Orders</Link></li> 
          </>
        )}

      {/* seller navber */}

        {role === "SELLER" && (
          <>
            <li><Link to="/seller">Home</Link></li>
            <li><Link to="/seller/products">My Products</Link></li>
            <li><Link to="/seller/products/new">Add Product</Link></li>
            <li><Link to="/seller/orders">Orders</Link></li>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/reports">Reports</Link></li>
          </>
        )}
      </ul>
       
       {/* for general it shows login and logout but in deshbord it shows logout*/}

      <div className="flex items-center gap-2">
        {!token ? (
          !role && (
            <>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Login</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded">Register</Link>
            </>
          )
        ) : (
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
