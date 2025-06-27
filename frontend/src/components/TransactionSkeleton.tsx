import React from 'react';
import { SkeletonLoader } from './LoadingSpinner';

interface TransactionSkeletonProps {
  count?: number;
}

const TransactionSkeleton: React.FC<TransactionSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Icon skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            
            <div className="flex-1 min-w-0">
              {/* Title and amount skeleton */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <SkeletonLoader className="h-4 w-32" />
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <SkeletonLoader className="h-4 w-20" />
              </div>
              
              {/* Date and status skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SkeletonLoader className="h-3 w-16" />
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <SkeletonLoader className="h-3 w-12" />
                </div>
                <SkeletonLoader className="h-3 w-16" />
              </div>
            </div>
            
            {/* Arrow skeleton */}
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionSkeleton; 