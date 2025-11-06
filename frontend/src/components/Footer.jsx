function Footer() {
    return(
        <footer className="bg-gray-900 text-white py-4 mt-10">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Shopease.All rights reserved</p>
                <p className="text-sm mt-1">Build with using React + Spring Boot + Mysql</p>
            </div>
        </footer>
    );
}
export default Footer;