import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className="bg-gray-100 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Get in touch</h2>
          <p className="mb-6 text-gray-600">
            Use our contact for all information request or contact us directly using the contact information below.
          </p>
          <div className="mb-6">
            <p className="mb-3 text-gray-600">
              Feel free to get in touch with us via email or phone
            </p>
          </div>
          
          <div className="flex items-start mb-6">
            <div className="bg-orange-100 p-2 rounded-full mr-4">
              <svg
                className="h-5 w-5 text-orange-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Our Office Location</h3>
              <p className="text-gray-600">Sta Maria Bulacan Philippines</p>
            </div>
          </div>
          
          <div className="flex items-start mb-8">
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <svg
                className="h-5 w-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Phone (Landline)</h3>
              <p className="text-gray-600">0915 894 9684</p>
            </div>
          </div>
          
          {/* Map */}
          <div className="w-full h-64 border border-gray-200 rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61795.39407439568!2d120.98486606674455!3d14.81980389751281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397a9f659525117%3A0xdca571e7c0c59840!2sSanta%20Maria%2C%20Bulacan!5e0!3m2!1sen!2sph!4v1695098455826!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-black p-8 rounded-lg shadow-sm text-white">
          <h2 className="text-2xl font-bold mb-6">Get started with a free quotation</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                className="w-full bg-white border-b border-gray-600 py-2 px-1 text-black placeholder-gray-400 focus:outline-none focus:border-green-500"
                type="text"
                id="name"
                name="name"
                placeholder="Enter your Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                className="w-full bg-white border-b border-gray-600 py-2 px-1 text-black placeholder-gray-400 focus:outline-none focus:border-green-500"
                type="email"
                id="email"
                name="email"
                placeholder="Enter a valid email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                className="w-full bg-white border-b border-gray-600 py-2 px-1 text-black placeholder-gray-400 focus:outline-none focus:border-green-500"
                id="message"
                name="message"
                placeholder="Enter your message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-6 flex items-center">
              <input 
                type="checkbox" 
                id="acceptTerms" 
                name="acceptTerms"
                className="mr-2" 
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="acceptTerms" className="text-sm">
                I accept the{" "}
                <a href="#" className="text-green-500 hover:text-green-400">
                  Terms of Services
                </a>
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition duration-200 uppercase tracking-wider cursor-pointer"
            >
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
