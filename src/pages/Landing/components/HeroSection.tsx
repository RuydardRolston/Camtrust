import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaBuilding, FaUsers, FaSmile, FaHeadset } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const stats = [
    { icon: <FaBuilding />, value: '100+', label: 'Projects' },
    { icon: <FaUsers />, value: '50+', label: 'Professionals' },
    { icon: <FaSmile />, value: '98%', label: 'Satisfaction' },
    { icon: <FaHeadset />, value: '24/7', label: 'Support' },
  ];

  const isDark = theme === 'dark';

  return (
    <section className={`relative overflow-hidden py-12 md:py-16 ${isDark ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Background accent - only in dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl"></div>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Grid: Hero Content and Construction Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Monitor Your <br />
              <span className="text-orange-400">Construction Projects</span> <br />
              From Anywhere
            </h1>

            <p className={`text-base sm:text-lg max-w-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              CamTrust helps property owners track construction progress in real-time with verified professionals, transparency and complete project history.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-lg transition shadow-lg shadow-orange-500/30 text-center"
              >
                Get Started
              </button>
              <button className={`font-semibold py-3.5 px-8 rounded-lg border flex items-center justify-center gap-2 transition ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 hover:border-orange-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 hover:border-orange-500'}`}>
                <FaPlay className="text-xs fill-current" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Construction Image */}
          <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'border border-orange-500/30 shadow-orange-500/20' : 'border border-gray-200'}`}>
            <img
              src="/src/assets/images/constructionsite.jpeg"
              alt="Construction Site with Cranes"
              className="w-full h-90 lg:h-105 object-cover"
            />
          </div>
        </div>

        {/* Bottom Full-Width Stats Cards Row */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t ${isDark ? 'border-slate-800/50' : 'border-gray-200'}`}>
          {stats.map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border-orange-500/30' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`p-3 rounded-lg text-xl ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-500'}`}>
                {stat.icon}
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-xs ${isDark ? 'text-orange-100/70' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;