import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

const Terms = () => {
  const containerAnim = useScrollAnimation({ threshold: 0.1 });
  const { settings } = useWebsiteSettings();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div 
          ref={containerAnim.ref}
          className={`bg-white shadow-md rounded-lg p-6 md:p-8 transition-all duration-700 ${
            containerAnim.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 font-['Bruno_Ace_SC']">
            Terms and Conditions
          </h1>

          <div className="text-sm text-gray-500 mb-6 pb-6 border-b">
            <p>Last Updated: September 19, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            {settings?.termsAndConditions ? (
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: settings.termsAndConditions }}
              />
            ) : (
              <>
            <p className="mb-6">
              Please read these terms and conditions carefully before using Our
              Service.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                1. Interpretation and Definitions
              </h2>

              <div className="ml-4">
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  1.1 Interpretation
                </h3>
                <p className="mb-4">
                  The words of which the initial letter is capitalized have
                  meanings defined under the following conditions. The following
                  definitions shall have the same meaning regardless of whether
                  they appear in singular or in plural.
                </p>

                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  1.2 Definitions
                </h3>
                <p className="mb-3">
                  For the purposes of these Terms and Conditions:
                </p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                  <li>
                    <strong>Company</strong> (referred to as either "the
                    Company", "We", "Us" or "Our" in this Agreement) refers to
                    Egie-Ecommerce.
                  </li>
                  <li>
                    <strong>Device</strong> means any device that can access the
                    Service such as a computer, a cellphone or a digital tablet.
                  </li>
                  <li>
                    <strong>Service</strong> refers to the Website.
                  </li>
                  <li>
                    <strong>Terms and Conditions</strong> (also referred as
                    "Terms") mean these Terms and Conditions that form the
                    entire agreement between You and the Company regarding the
                    use of the Service.
                  </li>
                  <li>
                    <strong>Website</strong> refers to Egie-Ecommerce,
                    accessible from www.egie-ecommerce.com
                  </li>
                  <li>
                    <strong>You</strong> means the individual accessing or using
                    the Service, or the company, or other legal entity on behalf
                    of which such individual is accessing or using the Service,
                    as applicable.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                2. Acknowledgment
              </h2>
              <p className="mb-4">
                These are the Terms and Conditions governing the use of this
                Service and the agreement that operates between You and the
                Company. These Terms and Conditions set out the rights and
                obligations of all users regarding the use of the Service.
              </p>
              <p className="mb-4">
                Your access to and use of the Service is conditioned on Your
                acceptance of and compliance with these Terms and Conditions.
                These Terms and Conditions apply to all visitors, users and
                others who access or use the Service.
              </p>
              <p className="mb-4">
                By accessing or using the Service You agree to be bound by these
                Terms and Conditions. If You disagree with any part of these
                Terms and Conditions then You may not access the Service.
              </p>
              <p className="mb-4">
                You represent that you are over the age of 18. The Company does
                not permit those under 18 to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                3. Purchases
              </h2>
              <p className="mb-4">
                If You wish to purchase any product or service made available
                through the Service ("Purchase"), You may be asked to supply
                certain information relevant to Your Purchase including, without
                limitation, Your credit card number, the expiration date of Your
                credit card, Your billing address, and Your shipping
                information.
              </p>
              <p className="mb-4">
                You represent and warrant that: (i) You have the legal right to
                use any credit card(s) or other payment method(s) in connection
                with any Purchase; and that (ii) the information You supply to
                us is true, correct and complete.
              </p>
              <p className="mb-4">
                By submitting such information, You grant us the right to
                provide the information to third parties for purposes of
                facilitating the completion of Purchases.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                4. Refunds
              </h2>
              <p className="mb-4">
                We issue refunds for Contracts within 30 days of the original
                purchase of the Contract.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                5. Prohibited Uses
              </h2>
              <p className="mb-3">
                You may use the Service only for lawful purposes and in
                accordance with Terms. You agree not to use the Service:
              </p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li>
                  In any way that violates any applicable national or
                  international law or regulation.
                </li>
                <li>
                  For the purpose of exploiting, harming, or attempting to
                  exploit or harm minors in any way.
                </li>
                <li>
                  To transmit, or procure the sending of, any advertising or
                  promotional material, including any "junk mail", "chain
                  letter," "spam," or any other similar solicitation.
                </li>
                <li>
                  To impersonate or attempt to impersonate Company, a Company
                  employee, another user, or any other person or entity.
                </li>
                <li>
                  In any way that infringes upon the rights of others, or in any
                  way is illegal, threatening, fraudulent, or harmful.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                6. Governing Law
              </h2>
              <p className="mb-4">
                The laws of the Country, excluding its conflicts of law rules,
                shall govern this Terms and Your use of the Service. Your use of
                the Application may also be subject to other local, state,
                national, or international laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                7. Changes to These Terms and Conditions
              </h2>
              <p className="mb-4">
                We reserve the right, at Our sole discretion, to modify or
                replace these Terms at any time. If a revision is material We
                will make reasonable efforts to provide at least 30 days' notice
                prior to any new terms taking effect. What constitutes a
                material change will be determined at Our sole discretion.
              </p>
              <p className="mb-4">
                By continuing to access or use Our Service after those revisions
                become effective, You agree to be bound by the revised terms. If
                You do not agree to the new terms, in whole or in part, please
                stop using the website and the Service.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                8. Contact Us
              </h2>
              <p className="mb-2">
                If you have any questions about these Terms and Conditions, You
                can contact us:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>By email: support@egie-ecommerce.com</li>
                <li>
                  By visiting this page on our website:{" "}
                  <Link
                    to="/contact"
                    className="text-green-600 hover:text-green-800"
                  >
                    www.egie-ecommerce.com/contact
                  </Link>
                </li>
                <li>By phone number: +1 (555) 123-4567</li>
              </ul>
            </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;