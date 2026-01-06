import React from "react";
import { Link } from "react-router-dom"; // Import Link
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { RiMastercardFill } from "react-icons/ri";
import { FaCcVisa } from "react-icons/fa";
import { useWebsiteSettings } from "../../../hooks/useWebsiteSettings";

const Footer = ({ isAuth }) => {
  const { settings } = useWebsiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${isAuth ? "" : "bg-black text-white py-8 text-center"}`}
    >
      {!isAuth && (
        <>
          <div className="flex flex-wrap justify-around items-start text-left px-4 sm:px-8">
            {/* Logo */}
            <div className="mb-6 w-full sm:w-auto">
              <img
                src={settings?.logoUrl || "/Logo/Nameless Logo.png"}
                alt={settings?.brandName || "EGIE Game Shop"}
                className="w-[280px] sm:w-[350px] mx-auto sm:mx-0"
              />
            </div>

            {/* Quick Links */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:underline">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contactus" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="hover:underline">
                    Compare
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:underline">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Contact Us</h4>
              <p>Email: {settings?.contactEmail || 'support@egiegameshop.com'}</p>
              <p>Phone: {settings?.contactPhone || '(123) 456-7890'}</p>
            </div>

            {/* Socials */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Follow Us:</h4>
              <div className="flex flex-row gap-3 items-center">
                {settings?.facebookUrl ? (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaFacebook className="text-white hover:text-green-500 text-2xl" />
                  </a>
                ) : (
                  <div className="opacity-50 cursor-not-allowed">
                    <FaFacebook className="text-gray-400 text-2xl" />
                  </div>
                )}
                {settings?.instagramUrl ? (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaInstagram className="text-white hover:text-green-500 text-2xl" />
                  </a>
                ) : (
                  <div className="opacity-50 cursor-not-allowed">
                    <FaInstagram className="text-gray-400 text-2xl" />
                  </div>
                )}
                {settings?.tiktokUrl ? (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <SiTiktok className="text-white hover:text-green-500 text-2xl" />
                  </a>
                ) : (
                  <div className="opacity-50 cursor-not-allowed">
                    <SiTiktok className="text-gray-400 text-2xl" />
                  </div>
                )}
                {settings?.twitterUrl ? (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <FaXTwitter className="text-white hover:text-green-500 text-2xl" />
                  </a>
                ) : (
                  <div className="opacity-50 cursor-not-allowed">
                    <FaXTwitter className="text-gray-400 text-2xl" />
                  </div>
                )}
              </div>
            </div>

            {/* Payments */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">We accept:</h4>
              <div className="flex flex-row space-x-2 justify-center sm:justify-start">
                <RiMastercardFill className="text-3xl" />
                <FaCcVisa className="text-3xl" />
              </div>
            </div>
          </div>

          <hr className="border-gray-600 my-6 mx-4" />

          <div className="text-sm px-4">
            <p>
              © {currentYear} {settings?.brandName || 'Egie Gameshop'}. {settings?.footerText || 'All rights reserved.'}{" "}
              <Link to="/terms" className="hover:underline">
                Terms of Service
              </Link>{" "}
              |{" "}
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </>
      )}
  
    </footer>
  );
};

export default Footer;
