import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import BayloLogo from '../components/BayloLogo';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 left-0 right-0 z-50 w-full">
        <nav className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex justify-between items-center relative">
            <Link to="/" className="flex items-center text-base md:text-2xl font-bold hover:opacity-80 transition-opacity flex-shrink-0" style={{ color: '#112250' }}>
              <img 
                src="/BayloLogo.svg" 
                alt="Baylo Logo" 
                className="w-10 h-10 md:w-16 md:h-16 mr-1 md:mr-3 flex-shrink-0"
              />
              <span className="text-base md:text-3xl font-bold flex-shrink-0" style={{ color: '#112250' }}>Baylo</span>
            </Link>
            <ul className="hidden lg:flex space-x-8 flex-shrink-0">
              <li><a href="#how-it-works" className="text-gray-600 hover:text-navy transition-colors">How It Works</a></li>
              <li><a href="#features" className="text-gray-600 hover:text-navy transition-colors">Features</a></li>
              <li><a href="#testimonials" className="text-gray-600 hover:text-navy transition-colors">Success Stories</a></li>
              <li><a href="#contact" className="text-gray-600 hover:text-navy transition-colors">Contact</a></li>
            </ul>
            <div className="hidden lg:flex space-x-4 flex-shrink-0">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-navy hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
        
        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 bg-white absolute top-full left-0 right-0 w-full"
            >
              <div className="container mx-auto px-4 py-4 space-y-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center border-2 border-[#112250] text-[#112250] rounded-lg font-medium hover:bg-[#112250] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center bg-[#112250] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cream to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-navy mb-6 leading-tight">
                Find Your Learning Partner
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Baylo connects learners and teachers based on shared interests and subjects. 
                Get personalized recommended matches and learn together in a community dedicated to knowledge sharing.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-navy mb-2">10,000+</div>
                  <div className="text-gray-600">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-navy mb-2">2,500+</div>
                  <div className="text-gray-600">Expert Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-navy mb-2">50,000+</div>
                  <div className="text-gray-600">Matches Made</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-80 md:w-96 h-[500px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-4 md:p-5 border-8 border-gray-800">
                <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-6 h-full flex flex-col">
                    <div className="bg-gradient-to-br from-blue-200 to-purple-200 h-48 md:h-56 rounded-xl mb-4 md:mb-5"></div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-navy mb-2 md:mb-3">Alex Chen</h3>
                      <p className="text-purple-600 font-semibold mb-3 md:mb-4 text-base md:text-lg">Web Development</p>
                      <div className="flex flex-wrap gap-2 md:gap-2.5 mb-4 md:mb-5">
                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 text-blue-700 rounded-full text-sm md:text-base font-medium">JavaScript</span>
                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 text-blue-700 rounded-full text-sm md:text-base font-medium">React</span>
                        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 text-blue-700 rounded-full text-sm md:text-base font-medium">Node.js</span>
                      </div>
                    </div>
                    <button 
                      className="w-full py-3 md:py-4 bg-gradient-to-r from-[#112250] to-[#2952c3] text-white rounded-xl md:rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg text-base md:text-lg"
                    >
                      Request Session
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-navy mb-12">How Baylo Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-user-plus text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">Create Your Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Tell us what you want to learn or what you can teach. Add your interests, subjects, and learning goals.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-brain text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">Smart Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Our system analyzes your skills and interests to recommend the perfect learning partners for you.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-comments text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">Match & Learn</h3>
              <p className="text-gray-600 leading-relaxed">
                When there's a mutual match, start chatting and plan your learning sessions together.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-navy mb-12">Why Choose Baylo?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "fas fa-handshake",
                title: "Mutual Learning",
                description: "Connect with people who share your learning interests and goals for productive sessions."
              },
              {
                icon: "fas fa-bolt",
                title: "Instant Matching",
                description: "Find learning partners quickly with our intelligent recommendation system."
              },
              {
                icon: "fas fa-shield-alt",
                title: "Safe Environment",
                description: "Learn in a secure platform with verified profiles and community guidelines."
              },
              {
                icon: "fas fa-globe",
                title: "Global Community",
                description: "Connect with learners and teachers from around the world."
              },
              {
                icon: "fas fa-chart-line",
                title: "Progress Tracking",
                description: "Monitor your learning journey and celebrate milestones with your partners."
              },
              {
                icon: "fas fa-users",
                title: "Advanced Video Calling",
                description: "Each session is accompanied by a video call to ensure the best learning experience."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <i className={`${feature.icon} text-2xl text-blue-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-navy mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-navy mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Through Baylo, I found an amazing programming mentor. We've been learning together for 6 months and I've landed my first developer job!",
                author: "Sarah Martinez",
                role: "Web Developer",
                initials: "SM"
              },
              {
                quote: "As a language teacher, Baylo helped me connect with students worldwide. It's revolutionized how I teach and learn from others.",
                author: "Thomas Johnson",
                role: "Language Teacher",
                initials: "TJ"
              },
              {
                quote: "I matched with three study partners for my data science course. We formed a study group and all aced our exams!",
                author: "Priya Lee",
                role: "Data Science Student",
                initials: "PL"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white" style={{ background: 'linear-gradient(to right, #112250, #2952c3)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners and teachers building knowledge together on Baylo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-[#112250] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Sign Up Free
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#112250] transition-colors">
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Baylo</h3>
              <p className="text-gray-400 mb-4">
                Baylo is a learning community where knowledge meets curiosity. 
                Teach what you know, learn what you want, and grow together.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400 mb-2">
                <i className="fas fa-envelope mr-2"></i>
                support@baylo.com
              </p>
              <p className="text-gray-400">
                <i className="fas fa-globe mr-2"></i>
                www.baylo.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Learning Tips</h3>
              <p className="text-gray-400 mb-4">Get weekly learning tips and community updates.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            &copy; 2025 Baylo. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
