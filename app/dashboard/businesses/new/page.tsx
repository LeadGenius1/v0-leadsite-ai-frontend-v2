'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'https://api.leadsite.ai';

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [targetBusinessType, setTargetBusinessType] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          website,
          industry,
          target_location: targetLocation,
          target_business_type: targetBusinessType,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business');
      }

      router.push('/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setLoading(false);
    }
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
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="text-white">Businesses</span>
            <Link href="#" className="hover:text-white transition-colors">Campaigns</Link>
            <Link href="#" className="hover:text-white transition-colors">Settings</Link>
          </div>
          <Link href="/dashboard" className="text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">Add Business</span>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            AI-POWERED LEAD GENERATION
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Add New Business
          </h1>
          <p className="text-neutral-400 text-sm font-light">
            Tell us about your business and who you want to reach. Our AI will analyze your website and find qualified prospects.
          </p>
        </div>

        <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs">1</div>
                  Your Business Details
                </h3>
                
                <div className="space-y-4 pl-8">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                      placeholder="Acme Marketing Agency"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Website URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                      placeholder="https://yourcompany.com"
                    />
                    <p className="text-xs text-neutral-500 mt-1.5">Our AI will analyze this to understand your services</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Industry <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-neutral-900">Select your industry</option>
                      <option value="marketing" className="bg-neutral-900">Marketing & Advertising</option>
                      <option value="software" className="bg-neutral-900">Software & Technology</option>
                      <option value="consulting" className="bg-neutral-900">Consulting & Professional Services</option>
                      <option value="finance" className="bg-neutral-900">Finance & Insurance</option>
                      <option value="healthcare" className="bg-neutral-900">Healthcare & Medical</option>
                      <option value="realestate" className="bg-neutral-900">Real Estate</option>
                      <option value="ecommerce" className="bg-neutral-900">E-commerce & Retail</option>
                      <option value="manufacturing" className="bg-neutral-900">Manufacturing</option>
                      <option value="construction" className="bg-neutral-900">Construction & Trades</option>
                      <option value="education" className="bg-neutral-900">Education & Training</option>
                      <option value="hospitality" className="bg-neutral-900">Hospitality & Tourism</option>
                      <option value="other" className="bg-neutral-900">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs">2</div>
                  Target Prospects
                </h3>
                
                <div className="space-y-4 pl-8">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Target Location <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm placeholder:text-neutral-600"
                      placeholder="San Francisco, CA"
                    />
                    <p className="text-xs text-neutral-500 mt-1.5">City, state, or region to search for prospects</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Target Business Type <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={targetBusinessType}
                      onChange={(e) => setTargetBusinessType(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm placeholder:text-neutral-600"
                      placeholder="Restaurants, Dental offices, Law firms..."
                    />
                    <p className="text-xs text-neutral-500 mt-1.5">What type of businesses do you want to reach?</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs">3</div>
                  Additional Context
                  <span className="text-neutral-500 font-normal">(Optional)</span>
                </h3>
                
                <div className="pl-8">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2">
                      Description & Notes
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-neutral-600 resize-none"
                      placeholder="Any additional information to help the AI understand your business and create better outreach messages..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">What happens next?</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Once you submit, our AI will analyze your website, search for prospects matching your criteria, 
                      enrich contact data, and generate personalized outreach emails. This typically takes 2-5 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group flex-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative bg-white text-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Business...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Start Lead Generation
                      </>
                    )}
                  </div>
                </button>
                
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancel
                </Link>
              </div>
            </form>
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
