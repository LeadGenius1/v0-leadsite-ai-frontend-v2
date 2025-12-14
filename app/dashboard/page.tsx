'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'https://api.leadsite.ai';

interface OverviewData {
  businesses: number;
  prospects: number;
  campaigns: number;
}

interface Business {
  id: number;
  name: string | null;
  website: string | null;
  industry: string | null;
  target_location: string | null;
  target_business_type: string | null;
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
      const [overviewRes, businessesRes, campaignsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/overview`, { headers }),
        fetch(`${API_URL}/api/dashboard/businesses`, { headers }),
        fetch(`${API_URL}/api/dashboard/campaigns`, { headers }),
      ]);

      if (overviewRes.status === 401 || businessesRes.status === 401 || campaignsRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const overviewData = await overviewRes.json();
      const businessesData = await businessesRes.json();
      const campaignsData = await campaignsRes.json();

      if (overviewData && typeof overviewData.businesses === 'number') {
        setOverview({
          businesses: overviewData.businesses || 0,
          prospects: overviewData.prospects || 0,
          campaigns: overviewData.campaigns || 0,
        });
      }

      if (businessesData && Array.isArray(businessesData.businesses)) {
        setBusinesses(businessesData.businesses);
      }

      if (campaignsData && Array.isArray(campaignsData.campaigns)) {
        setCampaigns(campaignsData.campaigns);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data.');
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link href="/dashboard/businesses/new" className="hover:text-white transition-colors">Businesses</Link>
            <Link href="#" className="hover:text-white transition-colors">Campaigns</Link>
            <Link href="#" className="hover:text-white transition-colors">Settings</Link>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
            Dashboard
          </h1>
          <p className="text-neutral-400 text-sm mt-2 font-light">Monitor your lead generation pipeline</p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Businesses</p>
              <p className="text-3xl font-medium text-white">{overview.businesses}</p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Prospects</p>
              <p className="text-3xl font-medium text-white">{overview.prospects}</p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">Campaigns</p>
              <p className="text-3xl font-medium text-white">{overview.campaigns}</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Your Businesses</h2>
            <Link href="/dashboard/businesses/new" className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <span className="relative inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Business
              </span>
            </Link>
          </div>

          <div className="p-6">
            {businesses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-neutral-400 text-sm mb-4 font-light">No businesses yet</p>
                <Link href="/dashboard/businesses/new" className="relative group inline-flex">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <span className="relative bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                    Add Your First Business
                  </span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Website</th>
                      <th className="pb-3 pr-4">Target Location</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Prospects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {businesses.map((business) => (
                      <tr key={business.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4 text-sm text-white">{business.name || 'Unnamed'}</td>
                        <td className="py-4 pr-4 text-sm text-indigo-400">{business.website || '-'}</td>
                        <td className="py-4 pr-4 text-sm text-neutral-400">{business.target_location || '-'}</td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            business.analysis_status === 'completed' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : business.analysis_status === 'processing'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {business.analysis_status || 'pending'}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-neutral-400">{business.prospect_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Your Campaigns</h2>
            <Link href="#" className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <span className="relative inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Campaign
              </span>
            </Link>
          </div>

          <div className="p-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-neutral-400 text-sm mb-4 font-light">No campaigns yet</p>
                <p className="text-neutral-500 text-xs">Add a business first to start generating campaigns</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Emails</th>
                      <th className="pb-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4 text-sm text-white">{campaign.name || 'Unnamed'}</td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            campaign.status === 'active' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30'
                          }`}>
                            {campaign.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-sm text-neutral-400">{campaign.email_count || 0}</td>
                        <td className="py-4 text-sm text-neutral-500">{new Date(campaign.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500">© 2024 LeadSite.AI. All systems nominal.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Help</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
