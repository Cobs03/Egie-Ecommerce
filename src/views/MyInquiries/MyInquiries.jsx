import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InquiryService from '../../services/InquiryService';
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Import components
import FilterTabs from './components/FilterTabs';
import InquiryList from './components/InquiryList';
import InquiryModal from './components/InquiryModal';

const MyInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');

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
          await loadInquiries();
        }
      }
    }
  };

  const handleModalUpdate = async () => {
    // Reload conversation
    if (selectedInquiry) {
      await handleViewInquiry(selectedInquiry.id);
    }
    // Refresh list
    await loadInquiries();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 font-['Bruno_Ace_SC']">My Product Inquiries</h1>
        <p className="text-gray-600">View and manage your product questions</p>
      </div>

      {/* Filter Tabs */}
      <FilterTabs filter={filter} setFilter={setFilter} />

      {/* Inquiries List */}
      <InquiryList
        inquiries={inquiries}
        loading={loading}
        onViewInquiry={handleViewInquiry}
      />

      {/* Conversation Modal */}
      <InquiryModal
        inquiry={selectedInquiry}
        user={user}
        onClose={() => setSelectedInquiry(null)}
        onUpdate={handleModalUpdate}
      />
    </div>
  );
};

export default MyInquiries;
