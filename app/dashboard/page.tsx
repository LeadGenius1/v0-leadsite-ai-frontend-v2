'use client';

export default function DashboardPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>LeadSite.AI Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: '0.9' }}>Total Prospects</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>247</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8' }}>+12% from last week</p>
        </div>
        
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: '0.9' }}>Emails Sent</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>1,842</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8' }}>Campaign active</p>
        </div>
        
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: '0.9' }}>Reply Rate</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>8.3%</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8' }}>Above average</p>
        </div>
        
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: '0.9' }}>Active Campaigns</h3>
          <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>3</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.8' }}>All running</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button style={{ pad
