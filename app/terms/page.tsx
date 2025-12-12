export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-gray-700 space-y-6">
          <p className="text-sm text-gray-600">Effective Date: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using LeadSite.AI (the "Service"), operated by AI Lead Strategies LLC ("we", "us", or "our"), 
              you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not 
              access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p>
              LeadSite.AI is an automated lead generation platform that analyzes your business, discovers prospects, 
              sends personalized outreach emails, and processes responses on your behalf. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Business website analysis and content extraction</li>
              <li>Automated prospect discovery and qualification</li>
              <li>AI-powered email personalization and sending</li>
              <li>Response tracking and sentiment analysis</li>
              <li>Campaign analytics and reporting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
            <p>To use the Service, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Be at least 18 years old or have legal capacity to enter contracts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Pricing</h3>
            <p>
              Subscription fees are based on your selected plan and are billed monthly or annually. Current pricing is 
              available on our website and may be updated with 30 days notice.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Billing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions automatically renew unless canceled</li>
              <li>Payment is due at the beginning of each billing cycle</li>
              <li>Failed payments may result in service suspension</li>
              <li>No refunds for partial months or unused services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Acceptable Use Policy</h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations, including anti-spam laws</li>
              <li>Send misleading, fraudulent, or deceptive content</li>
              <li>Harass, abuse, or harm individuals or organizations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware, viruses, or malicious code</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Resell or redistribute the Service without permission</li>
              <li>Use the Service for illegal or unethical purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Email Compliance</h2>
            <p>
              You are responsible for ensuring all email campaigns comply with applicable laws including CAN-SPAM Act, 
              GDPR, and other regulations. You must:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only contact prospects where you have legitimate business interest</li>
              <li>Ensure email content is truthful and not misleading</li>
              <li>Include accurate sender information</li>
              <li>Honor unsubscribe requests promptly</li>
              <li>Maintain compliance with sending limits and best practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding user content) remain the exclusive property of 
              AI Lead Strategies LLC. You are granted a limited license to use the Service for its intended purpose.
            </p>
            <p>
              You retain ownership of content you provide but grant us license to use it for providing and improving 
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Service Availability</h2>
            <p>
              While we strive for 99.9% uptime, we do not guarantee uninterrupted service. We may modify, suspend, or 
              discontinue the Service with reasonable notice. We are not liable for any modification, suspension, or 
              discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI LEAD STRATEGIES LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA, USE, OR GOODWILL.
            </p>
            <p>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless AI Lead Strategies LLC from claims, damages, and expenses 
              arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Termination</h2>
            <p>
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to the Service will be disabled</li>
              <li>Outstanding fees remain due and payable</li>
              <li>Data may be deleted after 30 days</li>
              <li>Sections that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the United States and the State of Delaware, without regard to 
              conflict of law principles. Any disputes shall be resolved in the courts of Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be notified via email or 
              through the Service with at least 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Information</h2>
            <p>
              For questions about these Terms, contact us at:
              <br /><br />
              AI Lead Strategies LLC<br />
              Email: legal@leadsite.ai<br />
              Website: <a href="https://leadsite.ai" className="text-blue-600 hover:underline">leadsite.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
