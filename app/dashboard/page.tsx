'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProspects: 0,
    totalEmails: 0,
    totalReplies: 0,
    activeCampaigns: 0
  });
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch overview stats
      const overviewRes = await fetch('https://api.leadsite.ai/api/dashboard/overview');
      const overviewData = await overviewRes.json();
      setStats(overviewData);

      // Fetch prospects
      const prospectsRes = await fetch('https://api.leadsite.ai/api/prospects');
      const prospectsData = await prospectsRes.json();
      setProspects(prospectsData.prospects || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const triggerWorkflow = async (workflowType) => {
    if (workflowType === 'analyze') {
      const websiteUrl = prompt('Enter website URL to analyze:');
      if (websiteUrl) {
        await fetch('https://n8n.srv1122252.hstgr.cloud/webhook/analyze-business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: 1,
            websiteUrl: websiteUrl,
            industry: 'Technology',
            targetAudience: 'B2B Companies'
          })
        });
        alert('Analysis started! Check back in a few minutes.');
        setTimeout(fetchDashboardData, 5000);
      }
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>LeadSite.AI Dashboard</h1>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3>Total Prospects</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalProspects}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3>Emails Sent</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalEmails}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3>Replies</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalReplies}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3>Active Campaigns</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.activeCampaigns}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => triggerWorkflow('analyze')}
            style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Analyze New Business
          </button>
          <button 
            onClick={fetchDashboardData}
            style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Prospects Table */}
      <div>
        <h2>Recent Prospects</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Company</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((prospect) => (
              <tr key={prospect.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px' }}>{prospect.name || 'N/A'}</td>
                <td style={{ padding: '10px' }}>{prospect.email || 'N/A'}</td>
                <td style={{ padding: '10px' }}>{prospect.company || prospect.industry}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: prospect.status === 'active' ? '#10b981' : '#6b7280',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {prospect.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
