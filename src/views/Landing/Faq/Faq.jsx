import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq = () => {
  const faqs = [
    {
      question: "Do you offer warranties on your products?",
      answer:
        "Yes! We provide manufacturer warranties on all products, ensuring quality and reliability.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-7 business days, but expedited options are available at checkout.",
    },
    {
      question: "Can I return a product if I'm not satisfied?",
      answer:
        "Absolutely! We offer a hassle-free return policy within 30 days of purchase.",
    },
    {
      question: "Do you offer bulk discounts?",
      answer:
        "Yes! Contact our sales team for exclusive bulk pricing and special offers.",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">FAQs</h1>

      <Accordion type="single" collapsible>
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left p-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-200">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="p-4 bg-gray-50 text-gray-600 rounded-md">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default Faq;
