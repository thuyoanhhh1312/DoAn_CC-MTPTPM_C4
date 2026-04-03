import React, { useState, useEffect } from 'react';
import { Image } from 'primereact/image';
import { Link } from 'react-router-dom';
import { Dropdown } from '../components/ui/dropdown/Dropdown';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../api/auth';
import { Badge } from 'antd';
import Header from '../components/ui/home/HomeHeader';

const MainHeader = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart ?? []);

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      if (token) {
        await logout(token);
      }
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const goToOrderHistory = () => { closeDropdown(); navigate("/order-history"); };
  const goToProfile = () => { closeDropdown(); navigate("/profile"); };
  function toggleDropdown() { setIsOpen(!isOpen); }
  function closeDropdown() { setIsOpen(false); }

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-effect shadow-header'
          : 'bg-white'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-[3px] bg-gold-gradient w-full" />

      {/* Main header row */}
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex-shrink-0 transition-premium hover:opacity-80">
          <Image
            src="https://cdn.pnj.io/images/logo/pnj.com.vn.png"
            width="90px"
            height="45px"
            alt="Logo PNJ"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden xl:block flex-1">
          <Header />
        </div>

        {/* Right side: User + Cart */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-gold-400 hover:bg-gold-50 transition-premium group"
              >
                {/* User avatar circle */}
                <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="font-medium text-sm text-gray-700 group-hover:text-gold-600 hidden sm:inline max-w-[120px] truncate">
                  {user?.name ? user?.name : user?.email.split('@')[0]}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-3 w-[240px] flex flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-card-hover z-50"
              >
                <div className="px-3 py-2 mb-1 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Xin chào</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || user?.email}
                  </p>
                </div>
                <button
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-premium"
                  onClick={goToProfile}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Tài khoản
                </button>
                <button
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-premium"
                  onClick={goToOrderHistory}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Lịch sử đơn hàng
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-premium"
                  onClick={handleLogout}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Đăng xuất
                </button>
              </Dropdown>
            </div>
          ) : (
            <Link
              to="/signin"
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gold-400 text-gold-600 font-semibold text-sm hover:bg-gold-gradient hover:text-white hover:border-transparent transition-premium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Đăng nhập
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gold-50 transition-premium group">
            <Badge
              count={cart.length}
              offset={[-2, 2]}
              size="small"
              style={{ backgroundColor: '#c48c46', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(196,140,70,0.4)' }}
              showZero={false}
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gold-600 transition-premium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </Badge>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gold-600 transition-premium hidden sm:inline">
              Giỏ hàng
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
