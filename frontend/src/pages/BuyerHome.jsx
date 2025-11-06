import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BuyerProducts from "./BuyerProducts";
function BuyerHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar role="BUYER" />
      <main className="flex-grow p-6 ">
        <BuyerProducts /> {/* Instantly show product browsing */}
      </main>
      <Footer />
    </div>
  );
}
export default BuyerHome;