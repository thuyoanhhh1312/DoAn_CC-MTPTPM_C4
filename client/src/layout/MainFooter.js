import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const MainFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-dark text-white relative overflow-hidden">
      {/* Gold top accent */}
      <div className="h-[3px] bg-gold-gradient w-full" />

      <div className="max-w-[1280px] mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-xl font-bold text-gold-300 mb-3">
              Oanh Ngoc Jewelry
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Trang sức bạc cao cấp, thiết kế tinh xảo, mang đến vẻ đẹp thanh lịch và sang trọng cho bạn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Liên kết
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="text-gray-300 hover:text-gold-300 transition-premium text-sm">
                Trang chủ
              </Link>
              <Link to="/promotions" className="text-gray-300 hover:text-gold-300 transition-premium text-sm">
                Khuyến mãi
              </Link>
              <Link to="/news" className="text-gray-300 hover:text-gold-300 transition-premium text-sm">
                Tin tức
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-gold-300 transition-premium text-sm">
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Kết nối
            </h4>
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: "https://facebook.com" },
                { icon: FaInstagram, href: "https://instagram.com" },
                { icon: FaTwitter, href: "https://twitter.com" },
                { icon: FaLinkedinIn, href: "https://linkedin.com" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gold-gradient hover:border-transparent hover:text-white transition-premium"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="divider-gold mt-10 mb-6 opacity-30" />
        <p className="text-center text-gray-500 text-sm">
          &copy; {year} Oanh Ngoc Jewelry Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default MainFooter;
