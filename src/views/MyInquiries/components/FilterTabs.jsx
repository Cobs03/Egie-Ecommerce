import React from 'react';

const FilterTabs = ({ filter, setFilter }) => {
  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'answered', label: 'Answered' },
    { value: 'closed', label: 'Closed' }
  ];

  return (
    <div className="flex space-x-2 mb-6 border-b">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => setFilter(tab.value)}
          className={`px-6 py-3 font-semibold transition-all duration-200 active:scale-95 ${
            filter === tab.value
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
