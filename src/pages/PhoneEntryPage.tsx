import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function PhoneEntryPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPhone: setAuthPhone } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number (basic validation)
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setLoading(true);
    try {
      await setAuthPhone(phone.trim());
      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-google-black mb-2">Welcome</h1>
          <p className="text-google-gray">Enter your phone number to continue</p>
        </div>

        <div className="card-google rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-google-black mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-google rounded-xl pl-10"
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-google-gray mt-2">
                We'll use this to identify your account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-google btn-primary rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-google-gray mt-6">
          First time? We'll create a free account for you automatically.
        </p>
      </div>
    </div>
  );
}
