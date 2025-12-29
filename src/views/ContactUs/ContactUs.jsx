import React from "react";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";

const ContactUs = () => {

  return (
    <div className="bg-gray-100 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactUs;
