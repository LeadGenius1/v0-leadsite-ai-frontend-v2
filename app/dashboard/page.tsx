'use client';

export default function DashboardPage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>LeadSite.AI Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px' }}>
          <h3>Total Prospects</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>Loading...</p>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px' }}>
          <h3>Emails Sent</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>Loading...</p>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '8px' }}>
          <h3>Replies</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>Loading...</p>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '8px' }}>
          <h3>Campaigns</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>System Status</h2>
        <p>✅ n8n Workflows: Active</p>
        <p>✅ Instantly.ai: Connected</p>
        <p>✅ Database: PostgreSQL on Railway</p>
        <p>✅ Backend API: api.leadsite.ai</p>
      </div>
    </div>
  );
}
