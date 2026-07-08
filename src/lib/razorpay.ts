declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  notes?: Record<string, string>;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

let scriptLoadPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID);
}

export function getRazorpayKeyId(): string {
  return RAZORPAY_KEY_ID || '';
}

export interface CheckoutParams {
  amount: number;
  description: string;
  notes?: Record<string, string>;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(params: CheckoutParams): Promise<void> {
  if (!RAZORPAY_KEY_ID) {
    throw new Error('Razorpay Key ID is not configured. Set VITE_RAZORPAY_KEY_ID in your environment.');
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK failed to initialize.');
  }

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: params.amount,
    currency: 'INR',
    name: 'Launch Business',
    description: params.description,
    notes: params.notes,
    handler: (response) => {
      params.onSuccess(response.razorpay_payment_id);
    },
    prefill: params.prefill,
    theme: { color: '#4285F4' },
    modal: {
      ondismiss: params.onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
