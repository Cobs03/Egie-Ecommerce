import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import InquiryCard from './InquiryCard';

const InquiryList = ({ inquiries, loading, onViewInquiry }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No inquiries found</h3>
        <p className="text-gray-600">Start by asking a question on a product page!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map(inquiry => (
        <InquiryCard
          key={inquiry.id}
          inquiry={inquiry}
          onClick={() => onViewInquiry(inquiry.id)}
        />
      ))}
    </div>
  );
};

export default InquiryList;
