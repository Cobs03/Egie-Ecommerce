import React, { useState } from "react";
import { toast } from "sonner";
import ContactService from "../../../services/ContactService";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // Clear error when user starts typing/checking
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase database
      const result = await ContactService.submitContactForm(formData);

      if (result.success) {
        toast.success(result.message || "Message sent successfully!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
          phone: "",
          acceptTerms: false
        });
        setErrors({});
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black p-8 rounded-lg shadow-sm text-white">
      <h2 className="text-2xl font-bold mb-6">Get started with a free quotation</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full bg-white border-b py-2 px-1 text-black placeholder-gray-400 focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
            }`}
            type="text"
            id="name"
            name="name"
            placeholder="Enter your Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full bg-white border-b py-2 px-1 text-black placeholder-gray-400 focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
            }`}
            type="email"
            id="email"
            name="email"
            placeholder="Enter a valid email address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="message">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full bg-white border-b py-2 px-1 text-black placeholder-gray-400 focus:outline-none resize-none ${
              errors.message ? 'border-red-500' : 'border-gray-600 focus:border-green-500'
            }`}
            id="message"
            name="message"
            placeholder="Enter your message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>
        
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                id="acceptTerms" 
                name="acceptTerms"
                className="w-5 h-5 text-green-500 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
            </div>
            <span className="ml-3 text-sm">
              I accept the{" "}
              <a href="#" className="text-green-500 hover:text-green-400 underline">
                Terms of Service
              </a>
              {" "}<span className="text-red-500">*</span>
            </span>
          </label>
          {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400 transition-all duration-200 uppercase tracking-wider cursor-pointer active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? "SENDING..." : "SUBMIT"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
