export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-700 space-y-6">
          <p className="text-sm text-gray-600">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              AI Lead Strategies LLC ("LeadSite.AI", "we", "us", or "our") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              lead generation platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address</li>
              <li>Company name and website URL</li>
              <li>Billing information (processed securely through our payment provider)</li>
              <li>Target market preferences and campaign settings</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automated Data Collection</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Business website content for analysis</li>
              <li>Prospect information from public sources</li>
              <li>Email engagement metrics (opens, clicks, replies)</li>
              <li>Platform usage analytics and performance data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our lead generation services</li>
              <li>To analyze your business and create personalized outreach campaigns</li>
              <li>To discover and qualify prospects based on your criteria</li>
              <li>To send automated emails on your behalf</li>
              <li>To process payments and manage subscriptions</li>
              <li>To improve our services and develop new features</li>
              <li>To communicate with you about your account and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information. We may share information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers (SendGrid for email, OpenAI for content generation, Apollo.io for data enrichment)</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Email Communications</h2>
            <p>
              Our platform sends emails on your behalf to prospects. Recipients can unsubscribe from these communications 
              at any time using the unsubscribe link in each email. We maintain suppression lists to ensure compliance 
              with anti-spam regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against 
              unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure hosting, 
              and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. 
              Campaign data is retained for 90 days after campaign completion. You may request deletion of your 
              data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal information</li>
              <li>Correct or update inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Information</h2>
            <p>
              For questions about this Privacy Policy or to exercise your rights, contact us at:
              <br /><br />
              AI Lead Strategies LLC<br />
              Email: privacy@leadsite.ai<br />
              Website: <a href="https://leadsite.ai" className="text-blue-600 hover:underline">leadsite.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Effective Date" above.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
