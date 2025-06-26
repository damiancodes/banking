import React from 'react';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  onTransferClick: () => void;
  onHistoryClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onTransferClick,
  onHistoryClick,
  onRefreshClick,
  isRefreshing = false
}) => {
  const actions: QuickAction[] = [
    {
      id: 'transfer',
      title: 'Send Money',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      onClick: onTransferClick
    },
    {
      id: 'history',
      title: 'History',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: onHistoryClick
    },
    {
      id: 'refresh',
      title: 'Refresh',
      icon: (
        <svg className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      onClick: onRefreshClick,
      disabled: isRefreshing
    }
  ];

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-kcb-light rounded-full flex items-center justify-center text-kcb-primary mb-2">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
