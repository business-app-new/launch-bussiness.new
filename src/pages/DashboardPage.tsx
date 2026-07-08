import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseReady } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Globe, Trash2, ExternalLink, Eye, Edit2, Crown, Share2, Copy, Loader2 } from 'lucide-react';

interface Website {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  slug: string | null;
  is_published: boolean;
  palette: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const { profile, phoneNumber, refreshProfile, checkCanCreateWebsite } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState<{ canCreate: boolean; reason?: string }>({
    canCreate: false,
  });

  useEffect(() => {
    if (phoneNumber && supabaseReady) {
      fetchWebsites();
      checkAndSetCanCreate();
    } else if (!supabaseReady) {
      setLoading(false);
    }
  }, [phoneNumber]);

  const fetchWebsites = async () => {
    if (!phoneNumber) return;

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load websites');
    } else {
      setWebsites((data as Website[]) ?? []);
    }
    setLoading(false);
  };

  const checkAndSetCanCreate = async () => {
    const result = await checkCanCreateWebsite();
    setCanCreate(result);
  };

  const getSubscriptionLimits = (status: string) => {
    switch (status) {
      case 'premium_500':
        return 2;
      case 'premium_1000':
        return 4;
      case 'premium_1500':
        return 10;
      default:
        return 1;
    }
  };

  const togglePublish = async (id: string, currentState: boolean) => {
    const { error } = await supabase.from('websites').update({ is_published: !currentState }).eq('id', id);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(currentState ? 'Unpublished' : 'Published');
      fetchWebsites();
    }
  };

  const deleteWebsite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    const { error } = await supabase.from('websites').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Website deleted');
      fetchWebsites();
      refreshProfile();
      checkAndSetCanCreate();
    }
  };

  const shareWebsite = async (site: Website) => {
    const url = `${window.location.origin}/site/${site.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: site.name, url });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  const duplicateWebsite = async (site: Website) => {
    const newSlug = `${site.slug}-copy-${Date.now().toString().slice(-5)}`;
    const { error } = await supabase.from('websites').insert({
      name: `${site.name} (Copy)`,
      type: site.type,
      city: site.city,
      slug: newSlug,
      is_published: false,
      palette: site.palette,
      phone_number: phoneNumber,
    });

    if (error) {
      toast.error('Failed to duplicate website');
    } else {
      toast.success('Website duplicated');
      fetchWebsites();
      refreshProfile();
      checkAndSetCanCreate();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-google-blue" />
      </div>
    );
  }

  const limit = getSubscriptionLimits(profile?.sub_status || 'free');
  const isFree = profile?.sub_status === 'free' || !profile?.sub_status;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with subscription banner for free users */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-google-black mb-2">Your Websites</h1>
          <p className="text-google-gray">
            {websites.length} of {limit} websites created
          </p>

          {/* Upgrade banner for free users */}
          {isFree && (
            <div className="mt-4 bg-gradient-to-r from-google-blue to-google-green rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6" />
                <h3 className="text-xl font-bold">Upgrade to Premium</h3>
              </div>
              <p className="mb-4 opacity-90">Create more websites and remove branding</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/subscription"
                  className="bg-white text-google-blue px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  View Plans
                </Link>
              </div>
              <div className="mt-4 text-sm opacity-80">
                Rs.500/mo (2 sites) / Rs.1000/mo (4 sites) / Rs.1500/mo (10 sites)
              </div>
            </div>
          )}
        </div>

        {/* Create new button */}
        {canCreate.canCreate ? (
          <Link
            to="/create"
            className="block w-full card-google rounded-2xl hover:shadow-xl transition-all text-center border-2 border-dashed border-google-blue mb-8"
          >
            <div className="py-8">
              <div className="w-16 h-16 bg-google-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-google-blue" />
              </div>
              <span className="text-xl font-medium text-google-blue">Create New Website</span>
            </div>
          </Link>
        ) : (
          <div className="card-google rounded-2xl text-center mb-8 bg-gray-100">
            <div className="py-8">
              <p className="text-google-gray mb-4">
                {canCreate.reason || "You've reached your website limit"}
              </p>
              <Link to="/subscription" className="btn-google btn-primary rounded-xl inline-flex">
                Upgrade Plan
              </Link>
            </div>
          </div>
        )}

        {/* Website list */}
        {websites.length > 0 ? (
          <div className="space-y-4">
            {websites.map((site) => (
              <div
                key={site.id}
                className="card-google rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-google-black">{site.name}</h3>
                  <p className="text-google-gray text-sm">
                    {site.type} - {site.city}
                  </p>
                  <p className="text-google-blue text-sm truncate">/site/{site.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-xl text-sm font-medium ${
                      site.is_published
                        ? 'bg-google-green/10 text-google-green'
                        : 'bg-gray-200 text-google-gray'
                    }`}
                  >
                    {site.is_published ? 'Published' : 'Draft'}
                  </span>
                  <a
                    href={`/site/${site.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl hover:bg-gray-100 text-google-blue"
                    title="View site"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => shareWebsite(site)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-google-gray"
                    title="Share link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => duplicateWebsite(site)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-google-gray"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => togglePublish(site.id, site.is_published)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-google-gray"
                    title={site.is_published ? 'Unpublish' : 'Publish'}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toast('Edit coming soon', { icon: '✏️' })}
                    className="p-2 rounded-xl hover:bg-gray-100 text-google-gray"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteWebsite(site.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-google-red"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-google-gray">No websites yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
