import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseReady } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Loader2, Globe } from 'lucide-react';

interface ServiceItem {
  title: string;
  price: string;
  image: string;
}

const PALETTES = [
  { id: 'blue', name: 'Google Blue', primary: '#4285F4', bg: 'from-blue-500 to-blue-600' },
  { id: 'green', name: 'Emerald Green', primary: '#34A853', bg: 'from-green-500 to-green-600' },
  { id: 'yellow', name: 'Amber Yellow', primary: '#FBBC04', bg: 'from-yellow-400 to-yellow-500' },
  { id: 'red', name: 'Google Red', primary: '#EA4335', bg: 'from-red-500 to-red-600' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

export default function CreateSitePage() {
  const { phoneNumber, refreshProfile, checkCanCreateWebsite } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([{ title: '', price: '', image: '' }]);
  const [palette, setPalette] = useState('blue');
  const [language, setLanguage] = useState('en');

  const addService = () => {
    setServices([...services, { title: '', price: '', image: '' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const generateSlug = (name: string) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 6)
    );
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Business name is required');
      setStep(1);
      return;
    }

    // Check if user can create website
    const canCreate = await checkCanCreateWebsite();
    if (!canCreate.canCreate) {
      toast.error(canCreate.reason || 'Cannot create more websites');
      navigate('/subscription');
      return;
    }

    setLoading(true);
    const slug = generateSlug(name);
    const validServices = services.filter((s) => s.title.trim());

    try {
      const { error } = await supabase.from('websites').insert({
        name,
        type,
        city,
        whatsapp,
        address,
        about,
        services: validServices,
        palette,
        lang: language,
        slug,
        is_published: true,
        phone_number: phoneNumber,
      });

      if (error) throw error;

      // Increment website count for the profile
      if (phoneNumber) {
        await supabase.rpc('increment_websites_count_by_phone', { p_phone: phoneNumber });
      }

      refreshProfile();
      toast.success('Website created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create website');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim() !== '';
    if (step === 2) return language.trim() !== '';
    if (step === 3) return services.some((s) => s.title.trim());
    return true;
  };

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card-google rounded-2xl text-center p-8">
          <p className="text-google-gray">Database is not configured. Please set up Supabase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-google-black">Create Your Website</h1>
            <span className="text-sm font-medium text-google-gray">
              Step {step} of 4
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-xl transition-all duration-300 ${
                  s <= step ? 'bg-google-blue' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Business Profile */}
        {step === 1 && (
          <div className="card-google rounded-2xl space-y-5">
            <div>
              <h2 className="text-xl font-bold text-google-black mb-1">Business Profile</h2>
              <p className="text-google-gray text-sm mb-4">Tell us about your business</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-google rounded-xl"
                placeholder="e.g. Sharma Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">
                Business Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-google rounded-xl"
                placeholder="e.g. Electronics Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-google rounded-xl"
                placeholder="e.g. Mumbai"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input-google rounded-xl"
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-google rounded-xl"
                placeholder="Full street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-google-black mb-2">About Us</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="input-google rounded-xl min-h-[100px] resize-y"
                placeholder="Describe your business..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Language Selection */}
        {step === 2 && (
          <div className="card-google rounded-2xl space-y-5">
            <div>
              <h2 className="text-xl font-bold text-google-black mb-1">Select Language</h2>
              <p className="text-google-gray text-sm mb-4">
                Choose your website's primary language
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`relative rounded-xl p-4 text-left transition-all duration-200 ${
                    language === lang.code
                      ? 'ring-2 ring-google-blue shadow-lg bg-google-blue/5'
                      : 'border-2 border-gray-200 hover:shadow-md hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-google-blue to-google-green flex items-center justify-center text-white font-bold text-sm">
                      {lang.code.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-google-black">{lang.name}</p>
                      <p className="text-sm text-google-gray">{lang.nativeName}</p>
                    </div>
                    {language === lang.code && (
                      <div className="w-6 h-6 bg-google-blue rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Products/Services */}
        {step === 3 && (
          <div className="card-google rounded-2xl space-y-5">
            <div>
              <h2 className="text-xl font-bold text-google-black mb-1">Products & Services</h2>
              <p className="text-google-gray text-sm mb-4">Add what you offer to your customers</p>
            </div>

            {services.map((service, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-xl p-4 space-y-3 relative"
              >
                {services.length > 1 && (
                  <button
                    onClick={() => removeService(index)}
                    className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-red-50 text-google-red"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <label className="block text-sm font-medium text-google-black mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(index, 'title', e.target.value)}
                    className="input-google rounded-xl"
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-google-black mb-1.5">
                    Price
                  </label>
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => updateService(index, 'price', e.target.value)}
                    className="input-google rounded-xl"
                    placeholder="e.g. Rs. 999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-google-black mb-1.5">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={service.image}
                    onChange={(e) => updateService(index, 'image', e.target.value)}
                    className="input-google rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addService}
              className="w-full border-2 border-dashed border-google-blue rounded-xl py-3 text-google-blue font-medium hover:bg-google-blue/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Product
            </button>
          </div>
        )}

        {/* Step 4: Theme Selector */}
        {step === 4 && (
          <div className="card-google rounded-2xl space-y-5">
            <div>
              <h2 className="text-xl font-bold text-google-black mb-1">Choose Your Theme</h2>
              <p className="text-google-gray text-sm mb-4">
                Pick a color palette for your website
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`relative rounded-2xl p-6 text-left transition-all duration-200 ${
                    palette === p.id
                      ? 'ring-2 ring-google-blue shadow-lg scale-[1.02]'
                      : 'border-2 border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${p.bg} mb-3`} />
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-google-black">{p.name}</span>
                    {palette === p.id && (
                      <div className="w-6 h-6 bg-google-blue rounded-xl flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-google-blue" />
                <span className="font-medium text-google-black">Website Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="text-google-gray">Name:</span> <span className="text-google-black font-medium">{name}</span></p>
                <p><span className="text-google-gray">Language:</span> <span className="text-google-black font-medium">{LANGUAGES.find(l => l.code === language)?.nativeName}</span></p>
                <p><span className="text-google-gray">Theme:</span> <span className="text-google-black font-medium">{PALETTES.find(p => p.id === palette)?.name}</span></p>
                <p><span className="text-google-gray">Products:</span> <span className="text-google-black font-medium">{services.filter(s => s.title.trim()).length} items</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-google bg-gray-100 text-google-black hover:bg-gray-200 rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-google btn-primary rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-google btn-success rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Website
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
