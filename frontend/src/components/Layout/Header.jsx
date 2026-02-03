/**
 * Header Component
 * 
 * Top navigation bar with logo and user menu.
 */

import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">FGC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Free Games Claimer</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              Home
            </Link>
            <Link to="/dashboard" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              Dashboard
            </Link>
            <Link to="/admin" className="block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100">
              Admin
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
