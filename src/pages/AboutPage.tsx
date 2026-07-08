import { Link } from 'react-router-dom';
import { Sparkles, Zap, Globe, Shield, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Create your business website in minutes, not days.' },
    { icon: Globe, title: '8 Languages', desc: 'AI-powered content generation in your native language.' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Your data is protected with enterprise-grade security.' },
    { icon: Sparkles, title: 'AI-Powered', desc: 'Smart content suggestions tailored to your business.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-google-blue/10 text-google-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            About Us
          </div>
          <h1 className="text-4xl font-bold text-google-black mb-4">
            Empowering Small Businesses
          </h1>
          <p className="text-google-gray text-lg leading-relaxed">
            Launch Business is an AI-powered website builder designed to help small businesses
            create professional, mobile-first customer portals in minutes. No coding required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {features.map((feature, i) => (
            <div key={i} className="card-google">
              <div className="w-12 h-12 rounded-xl bg-google-blue/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-google-blue" />
              </div>
              <h3 className="text-lg font-bold text-google-black mb-2">{feature.title}</h3>
              <p className="text-google-gray text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-google-blue to-google-green rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Launch?</h2>
          <p className="mb-6 opacity-90">Start building your business website today. It's free.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-google-blue px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
