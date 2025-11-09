import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InquiryService from '../../services/InquiryService';
import { toast } from 'sonner';
import { FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaReply, FaTimes } from 'react-icons/fa';

const MyInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, answered, closed
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user, filter]);

  const loadInquiries = async () => {
    setLoading(true);
    const { data, error } = await InquiryService.getMyInquiries({
      status: filter === 'all' ? null : filter
    });
    if (!error && data) {
      setInquiries(data);
    }
    setLoading(false);
  };

  const handleViewInquiry = async (inquiryId) => {
    const { data, error } = await InquiryService.getInquiryWithReplies(inquiryId);
    if (!error && data) {
      setSelectedInquiry(data);
      
      // Mark staff replies as read by customer
      const inquiry = inquiries.find(i => i.id === inquiryId);
      if (inquiry && inquiry.unread_by_customer > 0) {
        console.log('Marking replies as read for inquiry:', inquiryId, 'Unread count:', inquiry.unread_by_customer);
        const result = await InquiryService.markRepliesAsReadByCustomer(inquiryId);
        if (result.error) {
          console.error('Error marking as read:', result.error);
        } else {
          console.log('Successfully marked as read, refreshing list...');
          // Refresh the inquiries list to update the badge
          await loadInquiries();
        }
      }
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);
    const { error } = await InquiryService.addReply(selectedInquiry.id, replyText);
    
    if (!error) {
      toast.success('Reply sent successfully!');
      setReplyText('');
      await handleViewInquiry(selectedInquiry.id); // Reload conversation
      await loadInquiries(); // Refresh list
    } else {
      toast.error('Failed to send reply');
    }
    setSubmitting(false);
  };

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Product Inquiries</h1>
        <p className="text-gray-600">View and manage your product questions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'answered', label: 'Answered' },
          { value: 'closed', label: 'Closed' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-6 py-3 font-semibold transition-colors ${
              filter === tab.value
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaQuestionCircle className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No inquiries found</h3>
          <p className="text-gray-600">Start by asking a question on a product page!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div 
              key={inquiry.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
              onClick={() => handleViewInquiry(inquiry.id)}
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
          ))}
        </div>
      )}

      {/* Conversation Modal */}
      {selectedInquiry && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setSelectedInquiry(null)}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{selectedInquiry.subject}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-sm text-gray-600">{selectedInquiry.product?.name}</span>
                  <span className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${getStatusBadge(selectedInquiry.status)}`}>
                    {getStatusIcon(selectedInquiry.status)}
                    <span>{formatStatus(selectedInquiry.status)}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <FaTimes size={28} />
              </button>
            </div>

            {/* Product Info */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                {selectedInquiry.product?.images?.[0] && (
                  <img 
                    src={selectedInquiry.product.images[0]} 
                    alt={selectedInquiry.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedInquiry.product?.name}</h3>
                  <p className="text-sm text-gray-500">
                    Asked on {new Date(selectedInquiry.created_at).toLocaleDateString()}
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
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800">{selectedInquiry.question}</p>
              </div>

              {/* Replies */}
              {selectedInquiry.replies?.map(reply => (
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
            {selectedInquiry.status !== 'closed' && (
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
                    onClick={() => setSelectedInquiry(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddReply}
                    disabled={submitting || !replyText.trim()}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}

            {/* Closed Message */}
            {selectedInquiry.status === 'closed' && (
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
                <div className="flex items-center justify-center text-gray-600 mb-3">
                  <FaTimesCircle className="mr-2 text-xl" />
                  <p className="font-medium">This inquiry has been closed and cannot receive new replies.</p>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInquiries;
