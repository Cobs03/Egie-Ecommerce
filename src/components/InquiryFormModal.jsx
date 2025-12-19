import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import InquiryService from '../services/InquiryService';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const InquiryFormModal = ({ product, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to ask a question');
      return;
    }

    if (!subject.trim() || !question.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const { data, error } = await InquiryService.createInquiry({
        product_id: product.id,
        subject: subject.trim(),
        question: question.trim()
      });

      if (!error && data) {
        toast.success('Question submitted successfully!', {
          description: 'We\'ll get back to you soon.'
        });
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error('Failed to submit question', {
          description: error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Ask a Question</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64?text=' + product.name?.charAt(0);
                }}
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.category || 'Product'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Compatibility Question"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Briefly describe your question
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                required
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {question.length}/1000 characters
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !subject.trim() || !question.trim()}
            className="px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryFormModal;
