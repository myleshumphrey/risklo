import React from 'react';
import PageHeader from '../components/PageHeader';
import './TermsAndConditions.css'; // Reuse same styling

function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="terms-page">
      <PageHeader onNavigate={onNavigate} />
      <div className="terms-content">
        <div className="terms-card">
          <h1>Privacy Policy</h1>
          <p className="terms-last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="terms-section">
            <h2>1. Introduction</h2>
            <p>
              RiskLo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our risk assessment application and services ("Service").
            </p>
            <p>
              By using RiskLo, you agree to the collection and use of information in accordance with this Privacy Policy. 
              If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <p>When you use RiskLo, we may collect the following information that you voluntarily provide:</p>
            <ul className="terms-list">
              <li><strong>Google Account Information:</strong> When you sign in with Google, we collect your email address, name, and profile picture</li>
              <li><strong>Trading Data:</strong> Account sizes, contract counts, drawdown limits, profit/loss data, and strategy selections that you input into our calculators</li>
              <li><strong>CSV Upload Data:</strong> NinjaTrader account and strategy performance data that you upload for analysis</li>
              <li><strong>Payment Information:</strong> If you subscribe to RiskLo Pro, payment information is processed by Stripe (we do not store credit card details)</li>
            </ul>

            <h3>2.2 Google Sheets Data Access</h3>
            <p>
              If you connect your Google account to access Vector Algorithmics strategy data, we request <strong>read-only</strong> access to specific Google Sheets. 
              We only access sheets you explicitly authorize and only read strategy performance data necessary for risk calculations. 
              We do not access, read, or store any other Google Drive files or personal documents.
            </p>

            <h3>2.3 Automatically Collected Information</h3>
            <p>When you access our Service, we may automatically collect:</p>
            <ul className="terms-list">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service, and interaction patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to maintain your session and improve user experience</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="terms-list">
              <li><strong>Provide Risk Analysis:</strong> Calculate risk metrics, probabilities, and recommendations based on your trading data and strategy performance</li>
              <li><strong>Authenticate Users:</strong> Verify your identity and maintain secure access to your account</li>
              <li><strong>Process Subscriptions:</strong> Manage RiskLo Pro subscriptions and billing through Stripe</li>
              <li><strong>Send Email Notifications:</strong> Deliver risk analysis results via email when using the RiskLo Watcher desktop app or CSV upload features</li>
              <li><strong>Improve Our Service:</strong> Analyze usage patterns to enhance features, fix bugs, and optimize performance</li>
              <li><strong>Communicate with You:</strong> Send service-related announcements, updates, and respond to your inquiries</li>
              <li><strong>Ensure Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. How We Share Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            
            <h3>4.1 Service Providers</h3>
            <ul className="terms-list">
              <li><strong>Google:</strong> For authentication and Google Sheets API access (read-only)</li>
              <li><strong>Stripe:</strong> For payment processing and subscription management</li>
              <li><strong>SendGrid:</strong> For sending email notifications with risk analysis results</li>
              <li><strong>Railway/Netlify:</strong> For hosting and infrastructure services</li>
            </ul>
            <p>These service providers are contractually obligated to protect your information and use it only for the purposes we specify.</p>

            <h3>4.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required to do so by law or in response to valid requests by public authorities 
              (e.g., a court order, subpoena, or government agency).
            </p>

            <h3>4.3 Business Transfers</h3>
            <p>
              If RiskLo is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. 
              We will provide notice before your information is transferred and becomes subject to a different privacy policy.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to provide you with our Service and fulfill the purposes described in this Privacy Policy. 
              When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or regulatory purposes.
            </p>
            <p>
              <strong>Google OAuth Tokens:</strong> We store encrypted Google OAuth refresh tokens to maintain your connection to Google Sheets. 
              These tokens are deleted when you disconnect your Google account or delete your RiskLo account.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical security measures to protect your information from unauthorized access, 
              disclosure, alteration, and destruction. These measures include:
            </p>
            <ul className="terms-list">
              <li>Encryption of sensitive data in transit (HTTPS/TLS) and at rest</li>
              <li>Secure authentication via Google OAuth 2.0</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, 
              we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            
            <h3>7.1 Access and Correction</h3>
            <p>You can access and update your account information at any time through your Account page.</p>

            <h3>7.2 Data Deletion</h3>
            <p>
              You can request deletion of your account and personal data by contacting us. Note that some information may be retained for legal or regulatory purposes.
            </p>

            <h3>7.3 Google Sheets Access</h3>
            <p>
              You can revoke RiskLo's access to your Google Sheets at any time through your 
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer"> Google Account permissions page</a>.
            </p>

            <h3>7.4 Email Communications</h3>
            <p>
              You can opt out of non-essential email communications. However, we may still send you service-related emails 
              (e.g., account notifications, security alerts).
            </p>

            <h3>7.5 Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that disabling cookies may affect your ability to use certain features of our Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Third-Party Links and Services</h2>
            <p>
              Our Service may contain links to third-party websites, services, or resources (e.g., Vector Algorithmics, Apex Trader Funding, Google, Stripe). 
              We are not responsible for the privacy practices or content of these third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Children's Privacy</h2>
            <p>
              RiskLo is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. 
              If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. International Users</h2>
            <p>
              RiskLo is operated in the United States. If you are accessing our Service from outside the United States, please be aware that your information 
              may be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your country.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul className="terms-list">
              <li>The right to know what personal information we collect, use, and disclose</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to opt out of the sale of your personal information (note: we do not sell personal information)</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p>To exercise these rights, please contact us using the information below.</p>
          </section>

          <section className="terms-section">
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. 
              We will notify you of any material changes by updating the "Last Updated" date at the top of this policy and, where appropriate, 
              by sending you an email notification.
            </p>
            <p>
              Your continued use of RiskLo after such changes constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="terms-section">
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> myles2595@gmail.com<br />
              <strong>Website:</strong> <a href="https://risklo.io" target="_blank" rel="noopener noreferrer">https://risklo.io</a>
            </p>
          </section>

          <div className="terms-footer">
            <p>
              By using RiskLo, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

