import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-300">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using ReWear's sustainable fashion marketplace platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                ReWear provides an online marketplace platform that connects buyers and sellers of sustainable fashion items. Our service includes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Listing and browsing of pre-owned fashion items</li>
                <li>Secure payment processing and transaction management</li>
                <li>User communication and messaging features</li>
                <li>Community features and user reviews</li>
                <li>Reward system and coin-based incentives</li>
                <li>Customer support and dispute resolution</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts and Registration</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To access certain features of our platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 13 years old to create an account</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. User Conduct and Responsibilities</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You agree to use our platform responsibly and in accordance with these terms:
              </p>
              
              <h3 className="text-xl font-semibold text-blue-300 mb-3">4.1 Prohibited Activities</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-6">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Posting false, misleading, or fraudulent information</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with the proper functioning of the platform</li>
                <li>Selling counterfeit or illegal items</li>
                <li>Circumventing our fee structure or payment systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-blue-300 mb-3">4.2 Seller Responsibilities</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-6">
                <li>Accurately describe items and their condition</li>
                <li>Provide clear, high-quality images of items</li>
                <li>Ship items promptly and securely</li>
                <li>Respond to buyer inquiries in a timely manner</li>
                <li>Honor all commitments and agreements made</li>
                <li>Ensure items comply with our listing policies</li>
              </ul>

              <h3 className="text-xl font-semibold text-blue-300 mb-3">4.3 Buyer Responsibilities</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Review item descriptions and images carefully</li>
                <li>Ask questions before making a purchase</li>
                <li>Complete payments in a timely manner</li>
                <li>Provide accurate shipping information</li>
                <li>Leave honest and constructive feedback</li>
                <li>Respect seller policies and terms</li>
              </ul>
            </section>

            {/* Listing and Content */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Listings and User-Generated Content</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You retain ownership of content you submit to our platform, but grant us a license to use it:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>You retain ownership of your content</li>
                <li>You grant us a worldwide, non-exclusive license to use your content</li>
                <li>We may remove content that violates our policies</li>
                <li>You are responsible for the accuracy of your content</li>
                <li>We reserve the right to moderate and edit content as needed</li>
              </ul>
            </section>

            {/* Transactions and Payments */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Transactions and Payments</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Our platform facilitates transactions between buyers and sellers:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>We process payments through secure third-party providers</li>
                <li>Transaction fees are clearly disclosed before purchase</li>
                <li>Refunds are processed according to our refund policy</li>
                <li>We may hold funds temporarily for security purposes</li>
                <li>All prices are listed in the local currency</li>
                <li>Taxes and shipping costs are the responsibility of the parties</li>
              </ul>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Dispute Resolution</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We provide dispute resolution services for transaction issues:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Contact customer support for initial dispute resolution</li>
                <li>We may mediate disputes between buyers and sellers</li>
                <li>Our decisions are final and binding</li>
                <li>Legal disputes may be resolved through arbitration</li>
                <li>Small claims court is available for eligible disputes</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property Rights</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Our platform and its content are protected by intellectual property laws:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>ReWear owns all platform content and technology</li>
                <li>Our trademarks and logos are protected</li>
                <li>You may not copy or reproduce our content without permission</li>
                <li>User content remains owned by the user</li>
                <li>We respect third-party intellectual property rights</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Privacy and Data Protection</h2>
              <p className="text-slate-300 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. By using our platform, you consent to our data practices as described in our Privacy Policy.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>ReWear is not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid us in the past 12 months</li>
                <li>We are not responsible for user-generated content or third-party actions</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>Some jurisdictions do not allow liability limitations</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Indemnification</h2>
              <p className="text-slate-300 leading-relaxed">
                You agree to indemnify and hold harmless ReWear, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our platform, violation of these terms, or infringement of any rights of another party.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Account Termination</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may terminate or suspend your account at any time:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>For violation of these Terms of Service</li>
                <li>For fraudulent or illegal activities</li>
                <li>At your request</li>
                <li>For extended periods of inactivity</li>
                <li>Upon termination, your access to the platform will cease</li>
                <li>Some provisions survive account termination</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law and Jurisdiction</h2>
              <p className="text-slate-300 leading-relaxed">
                These Terms of Service are governed by the laws of [Your Jurisdiction]. Any disputes arising from these terms or your use of our platform will be resolved in the courts of [Your Jurisdiction], unless otherwise required by law.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Changes to Terms of Service</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of material changes by posting the updated terms on our platform and updating the "Last updated" date. Your continued use of our platform after such changes constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Severability</h2>
              <p className="text-slate-300 leading-relaxed">
                If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms of Service will otherwise remain in full force and effect.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-white/5 rounded-xl p-6">
                <p className="text-slate-300">
                  <strong>Email:</strong> legal@rewear.com<br/>
                  <strong>Address:</strong> ReWear Inc., 123 Sustainable Street, Green City, GC 12345<br/>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 