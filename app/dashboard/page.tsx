'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// API Base URL
const API_URL = 'https://api.leadsite.ai';

// Types matching backend responses exactly
interface OverviewData {
  businesses: number;
  prospects: number;
  campaigns: number;
}

interface Business {
  id: number;
  name: string | null;
  website: string | null;
  website_url: string | null;
  industry: string | null;
  description: string | null;
  analysis_status: string | null;
  created_at: string;
  prospect_count: string;
}

interface Campaign {
  id: number;
  name: string | null;
  status: string | null;
  created_at: string;
  email_count: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [overview, setOverview] = useState<OverviewData>({ businesses: 0, prospects: 0, campaigns: 0 });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData(token);
  }, [router]);

  async function fetchDashboardData(token: string) {
    setLoading(true);
    setError(null);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // Fetch all data in parallel
      const [overviewRes, businessesRes, campaignsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/overview`, { headers }),
        fetch(`${API_URL}/api/dashboard/businesses`, { headers }),
        fetch(`${API_URL}/api/dashboard/campaigns`, { headers }),
      ]);

      // Check for auth errors
      if (overviewRes.status === 401 || businessesRes.status === 401 || campaignsRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      // Parse responses
      const overviewData = await overviewRes.json();
      const businessesData = await businessesRes.json();
      const campaignsData = await campaignsRes.json();

      // Set overview - backend returns { businesses: X, prospects: X, campaigns: X }
      if (overviewData && typeof overviewData.businesses === 'number') {
        setOverview({
          businesses: overviewData.businesses || 0,
          prospects: overviewData.prospects || 0,
          campaigns: overviewData.campaigns || 0,
        });
      }

      // Set businesses - backend returns { businesses: [...] }
      if (businessesData && Array.isArray(businessesData.businesses)) {
        setBusinesses(businessesData.businesses);
      } else {
        setBusinesses([]);
      }

      // Set campaigns - backend returns { campaigns: [...] }
      if (campaignsData && Array.isArray(campaignsData.campaigns)) {
        setCampaigns(campaignsData.campaigns);
      } else {
        setCampaigns([]);
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LeadSite.AI</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Businesses</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.businesses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Prospects</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.prospects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.campaigns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Businesses Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Businesses</h2>
          </div>
          <div className="p-6">
            {businesses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">🏢</div>
                <p className="text-gray-500 mb-4">No businesses yet</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add Your First Business
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {business.name || 'Unnamed Business'}
                        </td>
                        <td className="px-4 py-4 text-sm text-blue-600">
                          {business.website || business.website_url || '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {business.industry || '-'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            business.analysis_status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : business.analysis_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {business.analysis_status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {business.prospect_count || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Campaigns</h2>
          </div>
          <div className="p-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">📧</div>
                <p className="text-gray-500 mb-4">No campaigns yet</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emails</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {campaign.name || 'Unnamed Campaign'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {campaign.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {campaign.email_count || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
