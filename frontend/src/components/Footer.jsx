function Footer() {
  return (
    <footer className="bg-emerald-600 text-gray-300 py-6 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} <span className="text-blue-900 font-semibold">ShopEase</span>. All rights reserved.</p>
        <p className="text-xs mt-2 opacity-100">
          Built with <span className="text-gray-800">React</span> + <span className="text-red-600">Spring Boot</span> + <span className="text-amber-300">MySQL</span>
        </p>
      </div>
    </footer>
  );
}
export default Footer;
