import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Static gradient background - Google Blue to Green */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
        }}
      />

      {/* Decorative blur elements */}
      <div
        className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: '#4285F4' }}
      />
      <div
        className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: '#34A853' }}
      />
      <div
        className="absolute top-[60%] left-[60%] w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: '#4285F4' }}
      />
      <div
        className="absolute top-[30%] right-[30%] w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: '#34A853' }}
      />

      {/* Content */}
      <div className="text-center max-w-4xl relative z-10 px-4">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-xl text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span style={{ fontFamily: 'Google Sans, system-ui, sans-serif' }}>
            AI-Powered Website Builder
          </span>
        </div>

        {/* Google-style Title - Large White Text */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-white mb-8 tracking-tight"
          style={{ fontFamily: 'Google Sans, system-ui, sans-serif', fontWeight: 400 }}
        >
          Launch Business
        </h1>

        {/* Description - White Text */}
        <p
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto"
          style={{ fontFamily: 'Google Sans, system-ui, sans-serif' }}
        >
          Create premium, professional business websites in minutes with AI-powered content in
          your native language.
        </p>

        {/* Get Started Button - Premium White */}
        <Link
          to={isAuthenticated ? '/create' : '/phone'}
          className="inline-flex items-center gap-3 bg-white text-google-blue px-10 sm:px-12 py-5 sm:py-6 rounded-xl text-lg sm:text-xl font-medium hover:shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 group"
          style={{ fontFamily: 'Google Sans, system-ui, sans-serif' }}
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Trust indicators */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-8 text-white/80 text-sm sm:text-base"
          style={{ fontFamily: 'Google Sans, system-ui, sans-serif' }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            8 languages
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Free forever plan
          </span>
        </div>
      </div>
    </div>
  );
}
