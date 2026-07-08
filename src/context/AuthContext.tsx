import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';

interface Profile {
  id: string;
  phone: string;
  sub_status: string;
  websites_count: number;
  subscription_active: boolean;
  subscription_expires_at: string | null;
}

interface AuthContextValue {
  phoneNumber: string | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  setPhone: (phone: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  updateSubscription: (tier: string) => Promise<void>;
  checkCanCreateWebsite: () => Promise<{ canCreate: boolean; reason?: string }>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = () => useContext(AuthContext);

const PHONE_STORAGE_KEY = 'launch_business_phone';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileByPhone = async (phone: string): Promise<Profile | null> => {
    if (!supabaseReady) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile | null;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!phoneNumber) return;
    const fetchedProfile = await fetchProfileByPhone(phoneNumber);
    setProfile(fetchedProfile);
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check localStorage for existing phone number
      const storedPhone = localStorage.getItem(PHONE_STORAGE_KEY);

      if (storedPhone && supabaseReady) {
        setPhoneNumber(storedPhone);
        const fetchedProfile = await fetchProfileByPhone(storedPhone);
        setProfile(fetchedProfile);
      }

      setLoading(false);
    };

    initAuth().catch((err) => {
      console.error('Auth initialization failed:', err);
      setLoading(false);
    });
  }, []);

  const setPhone = async (phone: string) => {
    if (!supabaseReady) {
      throw new Error('Database is not configured');
    }

    // Normalize phone number (remove spaces, ensure consistent format)
    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    setLoading(true);
    try {
      // Check if profile exists
      let fetchedProfile = await fetchProfileByPhone(normalizedPhone);

      if (!fetchedProfile) {
        // Create new profile with free tier
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            phone: normalizedPhone,
            email: `${normalizedPhone}@placeholder.local`,
            sub_status: 'free',
            websites_count: 0,
            subscription_active: false,
          })
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error creating profile:', error);
          throw new Error('Failed to create profile');
        }
        fetchedProfile = data as Profile;
      }

      setPhoneNumber(normalizedPhone);
      setProfile(fetchedProfile);
      localStorage.setItem(PHONE_STORAGE_KEY, normalizedPhone);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setPhoneNumber(null);
    setProfile(null);
    localStorage.removeItem(PHONE_STORAGE_KEY);
  };

  const updateSubscription = async (tier: string) => {
    if (!supabaseReady || !profile) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        sub_status: tier,
        subscription_active: tier !== 'free',
        subscription_expires_at:
          tier !== 'free'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
      })
      .eq('id', profile.id);

    if (error) throw error;
    await refreshProfile();
  };

  const checkCanCreateWebsite = async (): Promise<{ canCreate: boolean; reason?: string }> => {
    // Refresh profile first to get latest website count
    if (phoneNumber) {
      const freshProfile = await fetchProfileByPhone(phoneNumber);
      if (freshProfile) {
        setProfile(freshProfile);
      }
    }

    const profileToUse = profile;

    if (!profileToUse) {
      return { canCreate: false, reason: 'Please enter your phone number first' };
    }

    const limits: Record<string, number> = {
      free: 1,
      premium_500: 2,
      premium_1000: 4,
      premium_1500: 10,
    };

    const limit = limits[profileToUse.sub_status] || 1;

    if (profileToUse.websites_count >= limit) {
      if (profileToUse.sub_status === 'free') {
        return {
          canCreate: false,
          reason: 'Free tier allows only 1 website. Please upgrade to create more.',
        };
      }
      return {
        canCreate: false,
        reason: `You've reached your limit of ${limit} websites.`,
      };
    }

    return { canCreate: true };
  };

  const value: AuthContextValue = {
    phoneNumber,
    profile,
    loading,
    isAuthenticated: Boolean(phoneNumber),
    setPhone,
    signOut,
    refreshProfile,
    updateSubscription,
    checkCanCreateWebsite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
