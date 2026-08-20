import React from 'react';
import {
  FaEye,
  FaCheckCircle,
  FaShieldAlt,
  FaLightbulb,
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

interface ValueProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueProps & { isDark: boolean }> = ({ icon, title, description, isDark }) => (
  <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col items-center text-center space-y-3 ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-orange-500/30' : 'bg-white border border-gray-200/80 hover:border-orange-300'}`}>
    <div className={`p-3.5 rounded-xl text-xl flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100/80 text-orange-500'}`}>
      {icon}
    </div>
    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{description}</p>
  </div>
);

export const AboutSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const values = [
    {
      icon: <FaEye />,
      title: 'Transparency',
      description: 'Complete visibility every step',
    },
    {
      icon: <FaCheckCircle />,
      title: 'Accountability',
      description: 'Every action is recorded',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Integrity',
      description: 'Verified teams you can trust',
    },
    {
      icon: <FaLightbulb />,
      title: 'Innovation',
      description: 'Technology for better building',
    },
  ];

  return (
    <section id="about" className={`py-16 md:py-24 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Split: Text on Left, Photo on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* About Text Content */}
          <div className="space-y-4">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              About CamTrust
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              CamTrust is a digital platform that brings transparency and trust to construction project management. We connect property owners with verified professionals and provide real-time monitoring of project progress.
            </p>
          </div>

          {/* Construction Worker Image */}
          <div className={`rounded-2xl overflow-hidden shadow-lg ${isDark ? 'border border-slate-700/50' : 'border border-gray-200/80'}`}>
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80"
              alt="Construction Professional looking over site"
              className="w-full h-64 md:h-72 object-cover object-center"
            />
          </div>
        </div>

        {/* Bottom Horizontal Grid: 4 Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {values.map((value, index) => (
            <ValueCard
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;