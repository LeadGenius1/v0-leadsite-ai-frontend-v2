'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('https://api.leadsite.ai/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store the session token
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_company', data.user.company_name);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        width: '100%',
        maxWidth: '400px' 
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '24px', 
          textAlign: 'center',
          color: '#111827'
        }}>
          Create Your LeadSite.AI Account
        </h2>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#000000',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#000000',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Company Name
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#000000',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Your Company Inc."
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Website URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#000000',
                backgroundColor: '#ffffff',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="https://example.com"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: loading ? '#9ca3af' : '#6366f1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              fontWeight: '500', 
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
