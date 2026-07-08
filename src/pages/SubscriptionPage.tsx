import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout, isRazorpayConfigured } from '../lib/razorpay';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  sites: number;
  amount: number;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Rs. 0',
    period: 'forever',
    sites: 1,
    amount: 0,
    description: 'Free Tier',
    features: ['1 Website', 'Basic themes', 'Launch Business branding', 'Community support'],
    color: 'from-gray-400 to-gray-500',
  },
  {
    id: 'premium_500',
    name: 'Basic',
    price: 'Rs. 500',
    period: 'per month',
    sites: 2,
    amount: 50000,
    description: 'Basic Monthly Subscription',
    features: ['2 Websites', 'All themes', 'No branding', 'Email support'],
    color: 'from-google-blue to-blue-600',
    popular: false,
  },
  {
    id: 'premium_1000',
    name: 'Standard',
    price: 'Rs. 1000',
    period: 'per month',
    sites: 4,
    amount: 100000,
    description: 'Standard Monthly Subscription',
    features: ['4 Websites', 'All themes', 'No branding', 'Priority support', 'Custom domain'],
    color: 'from-google-green to-green-600',
    popular: true,
  },
  {
    id: 'premium_1500',
    name: 'Premium',
    price: 'Rs. 1500',
    period: 'per month',
    sites: 10,
    amount: 150000,
    description: 'Premium Monthly Subscription',
    features: ['10 Websites', 'All themes', 'No branding', '24/7 support', 'Custom domain', 'Analytics'],
    color: 'from-google-red to-red-600',
    popular: false,
  },
];

export default function SubscriptionPage() {
  const { profile, phoneNumber, updateSubscription } = useAuth();
  const currentStatus = profile?.sub_status || 'free';
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleFreeTier = () => {
    updateSubscription('free')
      .then(() => toast.success('You are now on the Free plan'))
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to update plan'));
  };

  const handlePaidPlan = async (plan: Plan) => {
    if (!isRazorpayConfigured()) {
      toast.error('Razorpay is not configured. Set VITE_RAZORPAY_KEY_ID.');
      return;
    }

    setProcessingPlan(plan.id);
    try {
      await openRazorpayCheckout({
        amount: plan.amount,
        description: plan.description,
        notes: { plan: plan.id, description: plan.description },
        prefill: {
          email: '',
          contact: phoneNumber || '',
        },
        onSuccess: (paymentId) => {
          alert(`Payment Successful! Your Payment ID: ${paymentId}`);
          updateSubscription(plan.id)
            .then(() => toast.success(`Upgraded to ${plan.name} plan!`))
            .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to activate plan'));
        },
        onDismiss: () => {
          toast('Payment cancelled', { icon: 'ℹ️' });
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === 'free') {
      handleFreeTier();
      return;
    }
    handlePaidPlan(plan);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-google-blue/10 text-google-blue px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Pricing Plans
          </div>
          <h1 className="text-4xl font-bold text-google-black mb-3">Choose Your Plan</h1>
          <p className="text-google-gray text-lg">Upgrade to create more websites and unlock premium features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentStatus === plan.id;
            const isProcessing = processingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`card-google relative ${
                  plan.popular ? 'ring-2 ring-google-blue shadow-xl scale-[1.02]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-google-blue text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-3 bg-google-green text-white text-xs font-bold px-3 py-1 rounded-full">
                    CURRENT
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-google-black">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-google-black">{plan.price}</span>
                  <span className="text-google-gray text-sm"> /{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-google-gray">
                      <Check className="w-4 h-4 text-google-green flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full btn-google ${
                    isCurrent
                      ? 'bg-gray-100 text-google-gray cursor-default'
                      : plan.id === 'free'
                        ? 'bg-gray-100 text-google-black hover:bg-gray-200'
                        : 'btn-primary'
                  } flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Free Forever'
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="text-google-blue hover:underline font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
