import { useState } from "react";
import "./Faq.css";

const Faq = () => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleFAQ = (index) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

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
    <div className="faqs-container">
      <h1>FAQs</h1>
      {faqs.map((faq, index) => (
        
        <div key={index} className="faq">
            <hr />
          <h3 onClick={() => toggleFAQ(index)} style={{ cursor: "pointer" }}>
            {faq.question}
          </h3>
          {openIndexes.includes(index) && <p>{faq.answer}</p>}
        </div>
      ))}
      <div className="contact">
        <h2>Still have questions?</h2>
        <button className="contact-btn">Contact Us</button>
      </div>
    </div>
  );
};

export default Faq;
