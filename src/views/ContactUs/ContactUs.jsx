import React from "react";

const ContactUs = () => {
  return (
    <div className="flex">
      {/* Left Section */}
      <div className="w-1/2 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Get in touch</h2>
        <p className="mb-4">
          Use our contact for all information requests or contact us directly
          using the contact information below.
        </p>
        <p className="mb-4">
          Feel free to get in touch with us via email or phone
        </p>
        <div className="flex items-center mb-4">
          <svg
            className="h-5 w-5 text-orange-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2V8.5m0 0a4.5 4.5 0 018 0m-8 0A4.5 4.5 0 009 8.5m3 9.5v3a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2h-5a2 2 0 00-2 2v3m-9-4v-3"
            />
          </svg>
          <div>
            <h3 className="font-bold">Our Office Location</h3>
            <p>Sta Maria Bulacan Philippines</p>
          </div>
        </div>
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8a6 6 0 00-6 6 6 6 0 006 6v4M4 12a6 6 0 016-6 6 6 0 00-6 6zM16 2v2M2 12h2M22 12h-2m-6-6h2M16 20v2"
            />
          </svg>
          <div>
            <h3 className="font-bold">Phone (Landline)</h3>
            <p>0915 894 9684</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 p-8 bg-gray-200">
        <h2 className="text-2xl font-bold mb-4">
          Get started with a free quotation
        </h2>
        <form>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              type="text"
              id="name"
              placeholder="Enter your Name"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              type="email"
              id="email"
              placeholder="Enter a valid email address"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              id="message"
              placeholder="Enter your message"
              rows={4}
            />
          </div>
          <div className="mb-4 flex items-center">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-sm">
              I accept the{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Terms of Services
              </a>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            Submit your request
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
