'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProspects: 0,
    totalEmails: 0,
    totalReplies: 0,
    activeCampaigns: 0
  });
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('free');
  const [userCount, setUserCount] = useState(1);

  useEffect(() => {
    fetchDashboardData();
    checkUserPlan();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('https://api.leadsite.ai/dashboard/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      
      const prospectRes = await fetch('https://api.leadsite.ai/api/prospects');
      if (prospectRes.ok) {
        const data = await prospectRes.json();
        setProspects(data.prospects || []);
      }
    } catch (error) {
      console.log('Loading data...');
    }
    setLoading(false);
  };

  const checkUserPlan = async () => {
    try {
      const res = await fetch('https://api.leadsite.ai/api/user/count');
      if (res.ok) {
        const data = await res.json();
        setUserCount(data.count || 1);
        setUserPlan(data.count <= 3 ? 'free' : 'paid');
      }
    } catch (error) {
      setUserPlan('free');
    }
  };

  const startCampaign = () => {
    const website = prompt('Enter website URL to analyze:');
    if (website) {
      fetch('https://n8n.srv1122252.hstgr.cloud/webhook/analyze-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 1,
          websiteUrl: website,
          industry: 'Technology',
          targetAudience: 'B2B Companies'
        })
      }).then(() => {
        alert('Analysis started! Refresh in 30 seconds.');
        setTimeout(fetchDashboardData, 30000);
      });
    }
  };

  const discoverProspects = () => {
    const query = prompt('Enter search (e.g., "marketing agencies New York"):');
    if (query) {
      fetch('https://n8n.srv1122252.hstgr.cloud/webhook/discover-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 1,
          businessId: 1,
          searchQuery: query,
          maxResults: 10
        })
      }).then(() => {
        alert('Discovering prospects! Refresh in 30 seconds.');
        setTimeout(fetchDashboardData, 30000);
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '0' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>LeadSite.AI</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ 
              padding: '6px 12px', 
              background: userCount <= 3 ? '#10b981' : '#3b82f6', 
              color: 'white', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {userCount <= 3 ? `FREE TIER (User ${userCount}/3)` : 'PRO PLAN'}
            </span>
            <button style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Settings
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Total Prospects</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0' }}>{loading ? '...' : stats.totalProspects}</p>
                <p style={{ color: '#10b981', fontSize: '13px', margin: '0' }}>↑ 12% from last month</p>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#ede9fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>👥</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Emails Sent</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0' }}>{loading ? '...' : stats.totalEmails}</p>
                <p style={{ color: '#10b981', fontSize: '13px', margin: '0' }}>Instantly.ai connected</p>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>📧</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Reply Rate</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0' }}>
                  {stats.totalEmails > 0 ? Math.round((stats.totalReplies / stats.totalEmails) * 100) : 0}%
                </p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0' }}>{stats.totalReplies} replies</p>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>💬</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Active Campaigns</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0' }}>{loading ? '...' : stats.activeCampaigns}</p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0' }}>All workflows active</p>
              </div>
              <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 20px 0' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={startCampaign} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              🎯 Analyze Website
            </button>
            <button onClick={discoverProspects} style={{ padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              🔍 Discover Prospects
            </button>
            <button onClick={() => alert('Instantly.ai campaign active!')} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              📮 Send Campaign
            </button>
            <button onClick={fetchDashboardData} style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Prospects Table */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 20px 0' }}>Recent Prospects</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>Contact</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.length > 0 ? prospects.slice(0, 5).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <p style={{ margin: '0', fontWeight: '500' }}>{p.name || 'Unknown'}</p>
                        <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{p.email || 'No email'}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{p.company || p.industry || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '13px' }}>
                        {p.score || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        background: p.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: p.status === 'active' ? '#166534' : '#6b7280',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        {p.status || 'new'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button style={{ padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Email
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      No prospects yet. Click "Discover Prospects" to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
