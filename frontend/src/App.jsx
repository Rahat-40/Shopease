import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BuyerHome from "./pages/BuyerHome";
import SellerHome from "./pages/SellerHome";
import BuyerProducts from "./pages/BuyerProducts";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrdersBuyer from "./pages/OrdersBuyer";
import OrdersSeller from "./pages/OrdersSeller";
import ProtectedRoute from "./components/ProtectedRoute";
import SellerProducts from "./pages/SellerProducts";
import AddProduct from "./pages/AddProduct";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
// Admin pages
import AdminHome from "./pages/AdminHome";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetail from "./pages/AdminOrderDetail";

import MyMessages from "./pages/MyMessages";
import MessageThread from "./pages/MessageThread";

import AdminMessages from "./pages/AdminMessages";
import AdminMessageThread from "./pages/AdminMessageThread";
import PaymentStatus from "./pages/PaymentStatus"; 
import OrderSuccess from "./pages/OrderSuccess"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<BuyerProducts />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />
        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/*SSLCommerz redirect landing page */}
        <Route path="/order/:status/:transactionId" element={<PaymentStatus />} />
        <Route path="/order/success/:transactionId" element={<OrderSuccess />} /> 

        {/* Protected dashboards*/}
        <Route path="/buyer" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><BuyerHome /></ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute allowedRoles={["SELLER"]}><SellerHome /></ProtectedRoute>
        } />

        
        {/* // Protected buyer actions*/}
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><Cart/></ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><Wishlist/></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><Checkout /></ProtectedRoute>
        } />
        <Route path="/buyer/orders" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><OrdersBuyer/></ProtectedRoute>
        } />
        <Route path="/buyer/products" element={
          <ProtectedRoute allowedRoles={["BUYER"]}><BuyerProducts/></ProtectedRoute>
        } />

                {/* Buyer Messages */}
        <Route path="/messages" element={<ProtectedRoute allowedRoles={["BUYER", "SELLER"]}><MyMessages /></ProtectedRoute>} />
        <Route path="/messages/:id" element={<ProtectedRoute allowedRoles={["BUYER", "SELLER"]}><MessageThread /></ProtectedRoute>} />

        
        {/* // Protected seller*/}
        <Route path="/seller/products" element={
          <ProtectedRoute allowedRoles={["SELLER"]}><SellerProducts /></ProtectedRoute>
        } />
        <Route path="/seller/products/new" element={
          <ProtectedRoute allowedRoles={["SELLER"]}><AddProduct /></ProtectedRoute>
        } />
        <Route path="/seller/orders" element={
          <ProtectedRoute allowedRoles={["SELLER"]}><OrdersSeller/></ProtectedRoute>
        } />

        {/* <Route path="/messages" element={<ProtectedRoute allowedRoles={["SELLER"]}><MyMessages /></ProtectedRoute>} />
        <Route path="/messages/:id" element={<ProtectedRoute allowedRoles={["SELLER"]}><MessageThread /></ProtectedRoute>} /> */}


        {/** admin  */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminOrderDetail /></ProtectedRoute>} />

        {/* Admin Messages */}
        <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminMessages /></ProtectedRoute>} />
        <Route path="/admin/messages/:id" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminMessageThread /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}
export default App;
