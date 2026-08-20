import React from 'react';
import {
  FaProjectDiagram,
  FaUserTie,
  FaChartLine,
  FaFileAlt,
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WorkCard: React.FC<CardProps & { isDark: boolean }> = ({ icon, title, description, isDark }) => (
  <div className={`rounded-xl shadow-lg hover:shadow-xl transition p-6 md:p-8 text-center h-full ${isDark ? 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-orange-500/30' : 'bg-white border border-gray-200 hover:border-orange-300'}`}>
    <div className="flex justify-center mb-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-500'}`}>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{description}</p>
  </div>
);

export const HowItWorks: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cards = [
    {
      icon: <FaProjectDiagram />,
      title: 'Create Project',
      description: 'Add your project and requirements.',
    },
    {
      icon: <FaUserTie />,
      title: 'Assign Team',
      description: 'Choose from verified professionals.',
    },
    {
      icon: <FaChartLine />,
      title: 'Track Progress',
      description: 'Get updates, photos and reports.',
    },
    {
      icon: <FaFileAlt />,
      title: 'Stay Informed',
      description: 'Receive alerts and access project information.',
    },
  ];

  return (
    <section id="how-it-works" className={`py-16 md:py-24 ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className={`text-3xl sm:text-4xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Simple steps to monitor your construction project
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {cards.map((card, index) => (
            <WorkCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
