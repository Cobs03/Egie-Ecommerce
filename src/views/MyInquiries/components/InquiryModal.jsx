import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaTimes, FaQuestionCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import InquiryService from '../../../services/InquiryService';

const InquiryModal = ({ inquiry, user, onClose, onUpdate }) => {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!inquiry) return null;

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

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);
    const { error } = await InquiryService.addReply(inquiry.id, replyText);
    
    if (!error) {
      toast.success('Reply sent successfully!');
      setReplyText('');
      onUpdate(); // Reload conversation and list
    } else {
      toast.error('Failed to send reply');
    }
    setSubmitting(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{inquiry.subject}</h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-sm text-gray-600">{inquiry.product?.name}</span>
              <span className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${getStatusBadge(inquiry.status)}`}>
                {getStatusIcon(inquiry.status)}
                <span>{formatStatus(inquiry.status)}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all duration-200 active:scale-90 hover:scale-110"
            aria-label="Close"
          >
            <FaTimes size={28} />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {inquiry.product?.images?.[0] && (
              <img 
                src={inquiry.product.images[0]} 
                alt={inquiry.product.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{inquiry.product?.name}</h3>
              <p className="text-sm text-gray-500">
                Asked on {new Date(inquiry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="px-6 py-4 space-y-4">
          {/* Original Question */}
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center mr-3 font-semibold text-orange-700">
                {user?.first_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">You</p>
                <p className="text-xs text-gray-500">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-gray-800">{inquiry.question}</p>
          </div>

          {/* Replies */}
          {inquiry.replies?.map(reply => (
            <div 
              key={reply.id}
              className={`p-4 rounded-lg ${
                reply.is_admin_reply 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'bg-gray-50 border-l-4 border-gray-400'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-semibold ${
                  reply.is_admin_reply ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {reply.user?.first_name?.[0] || (reply.is_admin_reply ? 'S' : 'Y')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-800">
                      {reply.is_admin_reply 
                        ? `${reply.user?.first_name || 'Staff'} ${reply.user?.last_name || ''}`.trim()
                        : 'You'}
                    </p>
                    {reply.is_admin_reply && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                        {reply.user?.role || 'Staff'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-800">{reply.reply_text}</p>
            </div>
          ))}
        </div>

        {/* Reply Input (only if not closed) */}
        {inquiry.status !== 'closed' && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a Follow-up Question
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your follow-up question here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="4"
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium active:scale-95 hover:scale-105"
              >
                Close
              </button>
              <button
                onClick={handleAddReply}
                disabled={submitting || !replyText.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium active:scale-95 hover:scale-105"
              >
                {submitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}

        {/* Closed Message */}
        {inquiry.status === 'closed' && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
            <div className="flex items-center justify-center text-gray-600 mb-3">
              <FaTimesCircle className="mr-2 text-xl" />
              <p className="font-medium">This inquiry has been closed and cannot receive new replies.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium active:scale-95 hover:scale-105"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
