import React from 'react';
import { Link } from 'react-router-dom';
import { FaHardHat, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FaHardHat className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-white">CamTrust</span>
            </Link>
            <p className="text-sm text-slate-400">
              Transforming construction transparency with real-time monitoring and verified professionals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-orange-400 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-orange-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-orange-400 transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-400 transition">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; 2024 CamTrust. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-orange-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-400 transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-orange-400 transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
