import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHardHat, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-slate-950/95 backdrop-blur-md shadow-lg shadow-orange-500/5 sticky top-0 z-50 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <FaHardHat className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-white">CamTrust</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 hover:text-white transition font-medium">
              Home
            </Link>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition font-medium">
              How it Works
            </a>
            <a href="#about" className="text-slate-300 hover:text-white transition font-medium">
              About
            </a>
            <a href="#contact" className="text-slate-300 hover:text-white transition font-medium">
              Contact
            </a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
            </button>
            <Link
              to="/login"
              className="px-6 py-2 text-slate-300 font-medium hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition shadow-lg shadow-orange-500/30"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <FaTimes className="text-white text-xl" />
            ) : (
              <FaBars className="text-white text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-slate-800 pt-4 space-y-4">
            <Link
              to="/"
              className="block text-slate-300 hover:text-white transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <a
              href="#how-it-works"
              className="block text-slate-300 hover:text-white transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#about"
              className="block text-slate-300 hover:text-white transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="block text-slate-300 hover:text-white transition font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 space-y-2 border-t border-slate-800">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition font-medium"
              >
                {theme === 'light' ? (
                  <>
                    <FaMoon className="text-lg" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <FaSun className="text-lg" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
              <Link
                to="/login"
                className="block px-6 py-2 text-slate-300 font-medium hover:text-white transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition text-center shadow-lg shadow-orange-500/30"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
