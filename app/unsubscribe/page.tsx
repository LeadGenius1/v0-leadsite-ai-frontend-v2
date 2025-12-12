'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Unsubscribe() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const campaignId = searchParams.get('campaign_id') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setErrorMessage('Email address is required');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, campaign_id: campaignId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else {
        setErrorMessage(data.message || 'An error occurred');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Failed to process unsubscribe request');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unsubscribe from LeadSite.AI</h1>
          <p className="text-gray-600">We're sorry to see you go</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Successfully Unsubscribed</h2>
              <p className="text-gray-600">
                {email ? `${email} has been` : 'You have been'} successfully removed from our mailing list.
              </p>
              <p className="text-sm text-gray-500">
                You will no longer receive automated outreach emails from LeadSite.AI campaigns.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  disabled={!!email}
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm Unsubscribe'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    This will stop all automated outreach emails from LeadSite.AI campaigns.
                    <br />
                    Account-related and transactional emails will still be sent if applicable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Having issues? Contact us at{' '}
            <a href="mailto:support@leadsite.ai" className="text-blue-600 hover:underline">
              support@leadsite.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
