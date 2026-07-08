import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Home, ShoppingBag, Clock, Star, QrCode,
  Phone, MapPin, MessageCircle, Printer, Share2, Heart, ThumbsUp, Bookmark, Navigation,
} from 'lucide-react';

interface ServiceItem {
  title: string;
  price: string;
  image: string;
}

interface Website {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  whatsapp: string | null;
  address: string | null;
  about: string | null;
  services: ServiceItem[] | null;
  palette: string | null;
  slug: string | null;
}

const PALETTE_MAP: Record<string, { primary: string; bg: string; text: string; light: string }> = {
  blue: { primary: '#4285F4', bg: 'bg-google-blue', text: 'text-google-blue', light: 'bg-blue-50' },
  green: { primary: '#34A853', bg: 'bg-google-green', text: 'text-google-green', light: 'bg-green-50' },
  yellow: { primary: '#FBBC04', bg: 'bg-google-yellow', text: 'text-yellow-600', light: 'bg-yellow-50' },
  red: { primary: '#EA4335', bg: 'bg-google-red', text: 'text-google-red', light: 'bg-red-50' },
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = ['9:00 AM - 9:00 PM', '9:00 AM - 9:00 PM', '9:00 AM - 9:00 PM', '9:00 AM - 9:00 PM', '9:00 AM - 9:00 PM', '9:00 AM - 9:00 PM', '10:00 AM - 6:00 PM'];

const REVIEWS = [
  { name: 'Priya Sharma', rating: 5, text: 'Amazing service and quality products. Highly recommend to everyone in the area!', avatar: 'P' },
  { name: 'Rahul Verma', rating: 5, text: 'Best experience I have had. The staff is friendly and prices are very reasonable.', avatar: 'R' },
  { name: 'Anita Desai', rating: 4, text: 'Great place with excellent customer support. Will definitely visit again.', avatar: 'A' },
];

type PageId = 'home' | 'products' | 'hours' | 'reviews' | 'qr';

export default function PublicSitePage() {
  const { slug } = useParams<{ slug: string }>();
  const [site, setSite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<PageId>('home');

  useEffect(() => {
    if (!slug) return;
    const fetchSite = async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }
      setSite(data as Website);
      setLoading(false);
    };
    fetchSite();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-google-blue border-t-transparent" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-google-black mb-2">Site Not Found</h1>
          <p className="text-google-gray">This website may have been removed or is no longer published.</p>
        </div>
      </div>
    );
  }

  const palette = PALETTE_MAP[site.palette || 'blue'] || PALETTE_MAP.blue;
  const today = new Date().getDay();
  const services = site.services ?? [];
  const whatsappLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, '')}`
    : '#';
  const mapsLink = site.address
    ? `https://maps.google.com/?q=${encodeURIComponent(site.address)}`
    : '#';

  const navItems: { id: PageId; icon: typeof Home; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'products', icon: ShoppingBag, label: 'Products' },
    { id: 'hours', icon: Clock, label: 'Hours' },
    { id: 'reviews', icon: Star, label: 'Reviews' },
    { id: 'qr', icon: QrCode, label: 'QR Flyer' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className={`${palette.bg} text-white px-4 py-6 sticky top-0 z-40 shadow-md`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{site.name}</h1>
            {site.type && <p className="text-white/80 text-sm">{site.type}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: site.name, url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Bookmark"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* HOME PAGE */}
        {activePage === 'home' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
            {/* Circular logo badge */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-28 h-28 rounded-full ${palette.bg} flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg`}>
                {site.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-google-black">{site.name}</h2>
              {site.city && <p className="text-google-gray">{site.city}</p>}
            </div>

            {/* About Us card */}
            {site.about && (
              <div className="card-google">
                <h3 className="text-lg font-bold text-google-black mb-2">About Us</h3>
                <p className="text-google-gray leading-relaxed">{site.about}</p>
              </div>
            )}

            {/* Call & Find Store buttons */}
            <div className="space-y-3">
              <a
                href={site.whatsapp ? `tel:${site.whatsapp}` : '#'}
                className="w-full btn-google btn-success flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-google btn-primary flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Find Our Store
              </a>
              {/* Extra buttons */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-google bg-green-50 text-google-green border-2 border-google-green/20 hover:bg-green-100 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-google bg-blue-50 text-google-blue border-2 border-google-blue/20 hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* PRODUCTS PAGE */}
        {activePage === 'products' && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <h2 className="text-2xl font-bold text-google-black mb-4">Our Products</h2>
            {services.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {services.map((service, i) => (
                  <div key={i} className="card-google p-3">
                    <div className="w-full h-32 rounded-xl bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                      {service.image ? (
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      )}
                    </div>
                    <h3 className="font-bold text-google-black text-sm mb-1">{service.title}</h3>
                    {service.price && <p className={`${palette.text} font-bold mb-2`}>{service.price}</p>}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-google btn-success text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Order via WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-google-gray">No products listed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* HOURS PAGE */}
        {activePage === 'hours' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
            <h2 className="text-2xl font-bold text-google-black">Opening Hours</h2>
            <div className="card-google space-y-3">
              {DAYS.map((day, i) => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className={`font-medium ${i === today ? 'text-google-black' : 'text-google-gray'}`}>{day}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-google-gray text-sm">{HOURS[i]}</span>
                    {i === today && (
                      <span className="px-2 py-0.5 rounded-full bg-google-green/10 text-google-green text-xs font-bold">
                        Open Now
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Latest Announcements */}
            <div className={`${palette.light} rounded-2xl p-5`}>
              <h3 className="font-bold text-google-black mb-2">Latest Announcements</h3>
              <p className="text-google-gray text-sm">
                We are now offering special discounts on selected items. Visit our store today!
              </p>
            </div>

            {/* Extra buttons */}
            <div className="flex gap-3">
              <a
                href={site.whatsapp ? `tel:${site.whatsapp}` : '#'}
                className="flex-1 btn-google btn-success flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call
              </a>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-google btn-primary flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Visit Us
              </a>
            </div>
          </div>
        )}

        {/* REVIEWS PAGE */}
        {activePage === 'reviews' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
            <h2 className="text-2xl font-bold text-google-black">Customer Reviews</h2>
            {REVIEWS.map((review, i) => (
              <div key={i} className="card-google">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${palette.bg} flex items-center justify-center text-white font-bold`}>
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-google-black">{review.name}</h3>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-google-yellow fill-google-yellow' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-google-gray text-sm leading-relaxed mb-3">{review.text}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-google-gray">Follow Our Journey</span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-google-gray transition-colors" title="Like">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-google-gray transition-colors" title="Love">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-google-gray transition-colors" title="Share">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Extra: Write a review button */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-google btn-success flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Leave a Review via WhatsApp
            </a>
          </div>
        )}

        {/* QR FLYER PAGE */}
        {activePage === 'qr' && (
          <div className="animate-[fadeIn_0.3s_ease]">
            <div className="bg-google-black text-white rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">{site.name}</h2>
              <p className="text-white/70 text-sm mb-6">Scan to View Our Menu, Hours & Location!</p>

              {/* QR Code placeholder */}
              <div className="w-56 h-56 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center p-4">
                <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${(i * 7 + 3) % 3 === 0 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>

              {site.whatsapp && (
                <p className="text-white/90 text-sm mb-1 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  {site.whatsapp}
                </p>
              )}
              {site.address && (
                <p className="text-white/70 text-sm mb-6 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {site.address}
                </p>
              )}

              <button
                onClick={() => window.print()}
                className="w-full bg-white text-google-black px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 print:hidden"
              >
                <Printer className="w-5 h-5" />
                Print Flyer Layout
              </button>

              {/* Extra buttons */}
              <div className="flex gap-3 mt-3 print:hidden">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-google-green text-white px-4 py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-google-blue text-white px-4 py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Directions
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all duration-200 ${
                activePage === item.id
                  ? `${palette.light} ${palette.text}`
                  : 'text-google-gray hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
