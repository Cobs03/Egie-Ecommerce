import React from 'react';
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaReply } from 'react-icons/fa';

const InquiryCard = ({ inquiry, onClick }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaQuestionCircle className="text-yellow-500" />;
      case 'answered': return <FaCheckCircle className="text-green-500" />;
      case 'closed': return <FaTimesCircle className="text-gray-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      answered: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-4 cursor-pointer active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <img 
          src={inquiry.product?.images?.[0]} 
          alt={inquiry.product?.name}
          className="w-20 h-20 object-cover rounded"
        />
        
        {/* Inquiry Details */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{inquiry.subject}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusBadge(inquiry.status)}`}>
              {getStatusIcon(inquiry.status)}
              <span>{formatStatus(inquiry.status)}</span>
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-2">{inquiry.product?.name}</p>
          <p className="text-gray-700 line-clamp-2">{inquiry.question}</p>
          
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
            {inquiry.reply_count > 0 && (
              <span className="flex items-center text-green-600">
                <FaReply className="mr-1" />
                {inquiry.reply_count} {inquiry.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            )}
            {inquiry.unread_by_customer > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {inquiry.unread_by_customer} NEW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryCard;
