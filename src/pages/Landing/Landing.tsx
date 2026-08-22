import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { AboutSection } from './components/AboutSection';

export const Landing: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      
      <main className="grow">
        <HeroSection />
        <HowItWorks />
        <AboutSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
