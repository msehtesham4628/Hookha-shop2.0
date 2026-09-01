import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, isAdmin, cart, wishlistIds, setCartOpen, setSearchOpen, logout } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Catalog', path: '/shop' },
    { label: 'Hookahs', path: '/shop?category=hookahs' },
    { label: 'Shisha Tobacco', path: '/shop?category=tobacco-flavor' },
    { label: 'Bowls', path: '/shop?category=bowls-phunnels' },
    { label: 'Charcoal', path: '/shop?category=charcoal' },
    { label: 'HMD & Accessories', path: '/shop?category=heat-management' },
    { label: 'Wholesale B2B', path: '/wholesale' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="tracking-wide">Age 21+ Verified Luxury Shisha Purveyor</span>
          </div>

          <div className="flex-1 text-center font-medium text-amber-100/90 tracking-wider">
            <span>Complimentary Express Air Delivery on All Orders Over $150</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <button
              onClick={() => onNavigate('/wholesale')}
              className="text-stone-300 hover:text-amber-400 transition-colors"
            >
              Lounge & B2B Wholesale
            </button>
            <span className="text-stone-700">|</span>
            <button
              onClick={() => onNavigate('/contact')}
              className="text-stone-300 hover:text-amber-400 transition-colors"
            >
              Concierge Desk
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Header Bar */}
      <div className={`transition-all duration-300 border-b border-stone-200 ${isScrolled ? 'py-3 shadow-xs bg-white/95 backdrop-blur-md' : 'py-4 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-800 hover:text-amber-900 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => onNavigate('/')}
            className="cursor-pointer flex flex-col items-center select-none group"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-stone-900 group-hover:text-amber-900 transition-colors">
                SULTAN
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.35em] text-amber-800/90 font-sans font-semibold -mt-1">
              HOOKAH CO. • EST. 2018
            </span>
          </div>

          {/* Desktop Search Bar Trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              id="desktop-search-trigger"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between bg-stone-100/80 hover:bg-stone-100 border border-stone-200 text-stone-500 text-xs px-4 py-2.5 rounded-xs transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-800 transition-colors" />
                <span className="tracking-wide">Search hookahs, dark leaf, bowls, coals...</span>
              </div>
              <kbd className="hidden lg:inline-block text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.5 rounded-xs border border-stone-300/80 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              id="mobile-search-btn"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-stone-700 hover:text-amber-900 transition-colors"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => onNavigate('/account?tab=wishlist')}
              className="relative p-2 text-stone-700 hover:text-amber-900 transition-colors"
              title="Luxury Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-amber-800 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              <button
                id="navbar-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-stone-700 hover:text-amber-900 transition-colors rounded-sm"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-semibold text-stone-800">
                  {user ? user.firstName : 'Sign In'}
                </span>
                <ChevronDown className="hidden sm:inline w-3 h-3 text-stone-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  id="user-dropdown-menu"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xs shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-900">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        {user.role !== 'CUSTOMER' && (
                          <span className="inline-block mt-1 text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-xs tracking-wider">
                            {user.role.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/account'); }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-900 flex items-center gap-2"
                      >
                        <Package className="w-3.5 h-3.5 text-stone-400" />
                        <span>My Account & Orders</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); onNavigate('/admin'); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50/60 hover:bg-amber-100 flex items-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5 text-amber-700" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 my-1"></div>

                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-stone-600 mb-3">Sign in to access orders, private reserve releases, and luxury perks.</p>
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/auth/login'); }}
                        className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold py-2 px-3 rounded-xs mb-2 transition-colors text-center block"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('/auth/register'); }}
                        className="w-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold py-2 px-3 rounded-xs transition-colors text-center block"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-amber-900 text-white px-3.5 py-2 rounded-xs shadow-xs transition-all duration-200 group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-sans tracking-wide">
                ${cart.subtotal.toFixed(2)}
              </span>
            </button>

            {/* Admin Switch Badge */}
            {isAdmin && (
              <button
                id="admin-quick-badge"
                onClick={() => onNavigate('/admin')}
                className="hidden lg:flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-xs shadow-2xs"
                title="Open Admin Portal"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Admin Suite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:block bg-white border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 py-2.5 text-xs uppercase font-medium tracking-widest text-stone-700">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path.startsWith('/shop') && currentPath.startsWith('/shop'));
              return (
                <li key={link.path}>
                  <button
                    onClick={() => onNavigate(link.path)}
                    className={`hover:text-amber-900 transition-colors py-1 relative ${
                      isActive ? 'text-amber-900 font-bold' : ''
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800 rounded-full" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[104px] z-50 bg-stone-950/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl">
            <div>
              <div className="mb-6">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 bg-stone-100 text-stone-600 text-xs p-3 rounded-xs border border-stone-200"
                >
                  <Search className="w-4 h-4 text-stone-500" />
                  <span>Search entire collection...</span>
                </button>
              </div>

              <ul className="space-y-4 text-sm font-medium text-stone-800">
                {navLinks.map((link) => (
                  <li key={link.path} className="border-b border-stone-100 pb-2">
                    <button
                      onClick={() => { onNavigate(link.path); setMobileMenuOpen(false); }}
                      className="w-full text-left uppercase tracking-wider text-xs font-semibold hover:text-amber-800"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-stone-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-900">{user.firstName} {user.lastName}</p>
                      <p className="text-[11px] text-stone-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('/admin'); setMobileMenuOpen(false); }}
                        className="text-[10px] uppercase font-bold bg-amber-800 text-white px-2 py-1 rounded-xs"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-xs text-rose-700 border border-rose-200 p-2 rounded-xs hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onNavigate('/auth/login'); setMobileMenuOpen(false); }}
                    className="flex-1 bg-stone-900 text-white text-xs font-semibold py-2.5 rounded-xs"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onNavigate('/auth/register'); setMobileMenuOpen(false); }}
                    className="flex-1 border border-stone-300 text-stone-800 text-xs font-semibold py-2.5 rounded-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
