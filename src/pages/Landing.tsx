import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CamTrust</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it Works</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition font-medium"
            >
              Login
            </button>
          </nav>
          <div className="md:hidden">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition text-sm font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white text-gray-900 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Monitor Your
                <span className="text-orange-500"> Construction Projects </span>
                From Anywhere
              </h1>
              <p className="text-gray-600 text-lg md:text-xl">
                Real-time visual monitoring of your construction site with world-class professionals and transparent process.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">100+</div>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">50+</div>
                  <p className="text-gray-600 text-sm">Team Members</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">98%</div>
                  <p className="text-gray-600 text-sm">Client Satisfaction</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500">24/7</div>
                  <p className="text-gray-600 text-sm">Support Available</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
                >
                  Get Started
                </button>
                <button className="border-2 border-gray-300 hover:border-orange-500 text-gray-900 font-semibold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2">
                  <span>Watch Demo</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="aspect-square bg-cover bg-center" style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(234, 88, 12, 0.1)), url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 400%27%3E%3Crect fill=%27%23f3f4f6%27 width=%27400%27 height=%27400%27/%3E%3C/svg%3E")',
                }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Simple steps to monitor your construction projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                step: '01',
                title: 'Set Up Your Site',
                description: 'Install cameras and sensors on your construction site'
              },
              {
                step: '02',
                title: 'Connect Devices',
                description: 'Connect all devices to the CamTrust platform'
              },
              {
                step: '03',
                title: 'Monitor in Real-Time',
                description: 'Get live updates and real-time monitoring from anywhere'
              },
              {
                step: '04',
                title: 'Analyze & Report',
                description: 'Generate detailed reports and analytics of your project'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-1 bg-orange-200 -z-10">
                    <div className="absolute right-0 w-2 h-2 bg-orange-500 rounded-full transform translate-y-1/2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* About Image */}
            <div className="relative order-2 md:order-1">
              <div className="bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-square bg-cover bg-center" style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(251, 146, 60, 0.8), rgba(234, 88, 12, 0.8)), url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 400%27%3E%3Crect fill=%27%23fff%27 width=%27400%27 height=%27400%27/%3E%3C/svg%3E")',
                }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-white opacity-30" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5M18.5 1.5l-7 7M18.5 1.5h-3m3 0v3" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">About CamTrust</h2>
              <p className="text-gray-600 text-lg">
                CamTrust is a digital platform that brings transparency and real-time monitoring to construction projects with experienced professionals and complete peace of mind.
              </p>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Transparency', desc: 'Complete visibility of your construction projects' },
                  { icon: '📊', title: 'Accessibility', desc: 'Access data from any device, anywhere' },
                  { icon: '🔒', title: 'Security', desc: 'Enterprise-grade security for your data' },
                  { icon: '✅', title: 'Reliability', desc: ' 99.9% uptime guarantee for monitoring' }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="text-3xl mt-1">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/register')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105 mt-4"
              >
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-linear-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Construction Management?</h2>
          <p className="text-xl text-orange-100">Join 100+ projects already using CamTrust for real-time monitoring</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-orange-500 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-orange-500 font-semibold py-3 px-8 rounded-lg transition">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-bold">CamTrust</span>
              </div>
              <p className="text-sm">Real-time construction project monitoring platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CamTrust. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
