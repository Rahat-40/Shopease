function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} <span className="text-emerald-500 font-semibold">ShopEase</span>. All rights reserved.</p>
        <p className="text-xs mt-2 opacity-80">
          Built with <span className="text-emerald-500">React</span> + <span className="text-sky-400">Spring Boot</span> + <span className="text-amber-400">MySQL</span>
        </p>
      </div>
    </footer>
  );
}
export default Footer;
