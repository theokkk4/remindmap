'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function NewHome() {
  const [activeTab, setActiveTab] = useState('features');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleNavigation = () => {
    window.location.href = '/map';
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'use-cases', label: 'Use Cases' }
  ];

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Insights',
      desc: 'Our AI automatically detects connections between your ideas and suggests meaningful relationships.'
    },
    {
      icon: '🤝',
      title: 'Real-time Collaboration',
      desc: 'Work together seamlessly with your team. See changes instantly and collaborate in real-time.'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      desc: 'Bank-level encryption and compliance standards protect your ideas and data.'
    },
    {
      icon: '🚀',
      title: 'Lightning Fast',
      desc: 'Built for speed. Your mind maps stay snappy no matter how complex they get.'
    }
  ];

  const useCases = [
    { 
      icon: '💡', 
      title: 'Brainstorming', 
      desc: 'Capture and organize ideas into coherent themes and actionable steps.' 
    },
    { 
      icon: '📊', 
      title: 'Project Planning', 
      desc: 'Turn complex projects into clear roadmaps with automatic task breakdown.' 
    },
    { 
      icon: '📚', 
      title: 'Study & Research', 
      desc: 'Synthesize information and build visual knowledge networks.' 
    },
    { 
      icon: '👥', 
      title: 'Team Meetings', 
      desc: 'Capture meeting notes in mind map form for better retention.' 
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-x-hidden">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10"
        style={{ background: 'rgba(10, 14, 39, 0.8)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3 text-white font-bold text-xl cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <span className="text-2xl">🧠</span>
              <span className="font-montserrat bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                ReMindMap
              </span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id 
                      ? 'text-blue-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      className="h-0.5 bg-blue-400 mt-1"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            <motion.button
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigation}
              className="hidden md:block px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Launch App
              <span className="ml-2 text-sm">→</span>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-2 pb-3 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        scrollToSection(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                        activeTab === tab.id
                          ? 'bg-blue-900/50 text-white'
                          : 'text-gray-300 hover:bg-blue-800/30 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={handleNavigation}
                    className="w-full mt-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-center shadow-md"
                  >
                    Launch App
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              Visualize Your Thoughts,
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
              Organize Your World
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your ideas into powerful visual mind maps. Collaborate in real-time, get AI-powered insights, and bring clarity to your thoughts.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigation}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started for Free
              <span className="ml-2">→</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="mt-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-slate-900/80 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold mb-2">Interactive Mind Map Preview</h3>
                <p className="text-gray-400">Visualize your ideas in real-time</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-blue-900/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-400 bg-blue-900/30 rounded-full mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to organize your thoughts</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Designed for clarity, built for collaboration, powered by AI</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -8,
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
                }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/30"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900/10 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-400 bg-blue-900/30 rounded-full mb-4">
              Use Cases
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for any creative workflow</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">From brainstorming to project management, ReMindMap adapts to your needs</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}
                className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/30 flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-gray-400">{useCase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900/10 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/20 rounded-2xl p-8 md:p-12 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your ideas?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of creative minds already using ReMindMap to bring their ideas to life</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNavigation}
                className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-100 transition-all duration-300"
              >
                Start for Free
                <span className="ml-2">→</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Schedule a Demo
              </motion.button>
            </div>
            <p className="mt-4 text-sm text-gray-400">No credit card required • Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🧠</span>
                <span className="font-bold text-xl bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                  ReMindMap
                </span>
              </div>
              <p className="text-gray-400 text-sm">The ultimate tool for visual thinking and collaboration. Transform your ideas into reality.</p>
              <div className="flex space-x-4 mt-6">
                {['Twitter', 'GitHub', 'LinkedIn', 'ProductHunt'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      {social[0]}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Templates', 'Integrations', 'Updates']
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Tutorials', 'Blog', 'Community', 'Support']
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Contact', 'Press', 'Legal']
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold text-white mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="md:flex md:items-center md:justify-between">
              <p className="text-sm text-gray-400">© 2023 ReMindMap. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                {['Privacy', 'Terms', 'Cookies'].map((item) => (
                  <a 
                    key={item} 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
