import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useWebsiteSettings } from '@/hooks/useWebsiteSettings';

const Policy = () => {
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
            Privacy Policy
          </h1>

          <div className="text-sm text-gray-500 mb-6 pb-6 border-b">
            <p>Last Updated: September 19, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            {settings?.privacyPolicy ? (
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
              />
            ) : (
              <>
            <p className="mb-6">
              This Privacy Policy describes Our policies and procedures on the
              collection, use and disclosure of Your information when You use
              the Service and tells You about Your privacy rights and how the
              law protects You.
            </p>
            <p className="mb-6">
              We use Your Personal data to provide and improve the Service. By
              using the Service, You agree to the collection and use of
              information in accordance with this Privacy Policy.
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
                <p className="mb-3">For the purposes of this Privacy Policy:</p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                  <li>
                    <strong>Account</strong> means a unique account created for
                    You to access our Service or parts of our Service.
                  </li>
                  <li>
                    <strong>Company</strong> (referred to as either "the
                    Company", "We", "Us" or "Our" in this Agreement) refers to
                    Egie-Ecommerce.
                  </li>
                  <li>
                    <strong>Cookies</strong> are small files that are placed on
                    Your computer, mobile device or any other device by a
                    website, containing the details of Your browsing history on
                    that website among its many uses.
                  </li>
                  <li>
                    <strong>Device</strong> means any device that can access the
                    Service such as a computer, a cellphone or a digital tablet.
                  </li>
                  <li>
                    <strong>Personal Data</strong> is any information that
                    relates to an identified or identifiable individual.
                  </li>
                  <li>
                    <strong>Service</strong> refers to the Website.
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
                2. Collecting and Using Your Personal Data
              </h2>

              <div className="ml-4 mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  2.1 Types of Data Collected
                </h3>

                <div className="ml-4">
                  <h4 className="text-base font-medium mb-2 text-gray-700">
                    Personal Data
                  </h4>
                  <p className="mb-3">
                    While using Our Service, We may ask You to provide Us with
                    certain personally identifiable information that can be used
                    to contact or identify You. Personally identifiable
                    information may include, but is not limited to:
                  </p>
                  <ul className="list-disc ml-6 space-y-1 mb-4">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Address, State, Province, ZIP/Postal code, City</li>
                    <li>Usage Data</li>
                  </ul>

                  <h4 className="text-base font-medium mb-2 text-gray-700">
                    Usage Data
                  </h4>
                  <p className="mb-3">
                    Usage Data is collected automatically when using the
                    Service.
                  </p>
                  <p className="mb-3">
                    Usage Data may include information such as Your Device's
                    Internet Protocol address (e.g. IP address), browser type,
                    browser version, the pages of our Service that You visit,
                    the time and date of Your visit, the time spent on those
                    pages, unique device identifiers and other diagnostic data.
                  </p>
                  <p className="mb-3">
                    When You access the Service by or through a mobile device,
                    We may collect certain information automatically, including,
                    but not limited to, the type of mobile device You use, Your
                    mobile device unique ID, the IP address of Your mobile
                    device, Your mobile operating system, the type of mobile
                    Internet browser You use, unique device identifiers and
                    other diagnostic data.
                  </p>
                  <p className="mb-3">
                    We may also collect information that Your browser sends
                    whenever You visit our Service or when You access the
                    Service by or through a mobile device.
                  </p>

                  <h4 className="text-base font-medium mb-2 text-gray-700">
                    Tracking Technologies and Cookies
                  </h4>
                  <p className="mb-3">
                    We use Cookies and similar tracking technologies to track
                    the activity on Our Service and store certain information.
                    Tracking technologies used are beacons, tags, and scripts to
                    collect and track information and to improve and analyze Our
                    Service.
                  </p>
                  <p className="mb-3">
                    You can instruct Your browser to refuse all Cookies or to
                    indicate when a Cookie is being sent. However, if You do not
                    accept Cookies, You may not be able to use some parts of our
                    Service.
                  </p>
                </div>
              </div>

              <div className="ml-4 mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  2.2 Use of Your Personal Data
                </h3>
                <p className="mb-3">
                  The Company may use Personal Data for the following purposes:
                </p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                  <li>
                    <strong>To provide and maintain our Service</strong>,
                    including to monitor the usage of our Service.
                  </li>
                  <li>
                    <strong>To manage Your Account</strong>: to manage Your
                    registration as a user of the Service.
                  </li>
                  <li>
                    <strong>For the performance of a contract</strong>: the
                    development, compliance and undertaking of the purchase
                    contract for the products, items or services You have
                    purchased or of any other contract with Us through the
                    Service.
                  </li>
                  <li>
                    <strong>To contact You</strong>: To contact You by email,
                    telephone calls, SMS, or other equivalent forms of
                    electronic communication.
                  </li>
                  <li>
                    <strong>To provide You</strong> with news, special offers
                    and general information about other goods, services and
                    events which we offer that are similar to those that you
                    have already purchased or enquired about unless You have
                    opted not to receive such information.
                  </li>
                  <li>
                    <strong>To manage Your requests</strong>: To attend and
                    manage Your requests to Us.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                3. Disclosure of Your Personal Data
              </h2>
              <p className="mb-3">
                The Company may share Your personal information in the following
                situations:
              </p>
              <ul className="list-disc ml-6 space-y-2 mb-4">
                <li>
                  <strong>With Service Providers</strong>: We may share Your
                  personal information with Service Providers to monitor and
                  analyze the use of our Service, to contact You.
                </li>
                <li>
                  <strong>For business transfers</strong>: We may share or
                  transfer Your personal information in connection with, or
                  during negotiations of, any merger, sale of Company assets,
                  financing, or acquisition of all or a portion of our business
                  to another company.
                </li>
                <li>
                  <strong>With Affiliates</strong>: We may share Your
                  information with Our affiliates, in which case we will require
                  those affiliates to honor this Privacy Policy.
                </li>
                <li>
                  <strong>With business partners</strong>: We may share Your
                  information with Our business partners to offer You certain
                  products, services or promotions.
                </li>
                <li>
                  <strong>With other users</strong>: when You share personal
                  information or otherwise interact in the public areas with
                  other users, such information may be viewed by all users and
                  may be publicly distributed outside.
                </li>
                <li>
                  <strong>With Your consent</strong>: We may disclose Your
                  personal information for any other purpose with Your consent.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                4. Retention of Your Personal Data
              </h2>
              <p className="mb-4">
                The Company will retain Your Personal Data only for as long as
                is necessary for the purposes set out in this Privacy Policy. We
                will retain and use Your Personal Data to the extent necessary
                to comply with our legal obligations (for example, if we are
                required to retain your data to comply with applicable laws),
                resolve disputes, and enforce our legal agreements and policies.
              </p>
              <p className="mb-4">
                The Company will also retain Usage Data for internal analysis
                purposes. Usage Data is generally retained for a shorter period
                of time, except when this data is used to strengthen the
                security or to improve the functionality of Our Service, or We
                are legally obligated to retain this data for longer time
                periods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                5. Security of Your Personal Data
              </h2>
              <p className="mb-4">
                The security of Your Personal Data is important to Us, but
                remember that no method of transmission over the Internet, or
                method of electronic storage is 100% secure. While We strive to
                use commercially acceptable means to protect Your Personal Data,
                We cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                6. Children's Privacy
              </h2>
              <p className="mb-4">
                Our Service does not address anyone under the age of 13. We do
                not knowingly collect personally identifiable information from
                anyone under the age of 13. If You are a parent or guardian and
                You are aware that Your child has provided Us with Personal
                Data, please contact Us. If We become aware that We have
                collected Personal Data from anyone under the age of 13 without
                verification of parental consent, We take steps to remove that
                information from Our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                7. Changes to this Privacy Policy
              </h2>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will
                notify You of any changes by posting the new Privacy Policy on
                this page.
              </p>
              <p className="mb-4">
                We will let You know via email and/or a prominent notice on Our
                Service, prior to the change becoming effective and update the
                "Last updated" date at the top of this Privacy Policy.
              </p>
              <p className="mb-4">
                You are advised to review this Privacy Policy periodically for
                any changes. Changes to this Privacy Policy are effective when
                they are posted on this page.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                8. Contact Us
              </h2>
              <p className="mb-2">
                If you have any questions about this Privacy Policy, You can
                contact us:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>By email: privacy@egie-ecommerce.com</li>
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

export default Policy;