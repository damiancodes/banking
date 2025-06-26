import React from 'react';

interface CurrencyIconProps {
  currency: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const colorClasses = {
    KES: 'bg-currency-kes text-white',
    USD: 'bg-kcb-primary text-white',
    NGN: 'bg-currency-ngn text-white'
  };

  const symbols = {
    KES: 'KS',
    USD: '$',
    NGN: '₦'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${colorClasses[currency as keyof typeof colorClasses] || 'bg-gray-500 text-white'}
      rounded-full flex items-center justify-center font-semibold
      ${className}
    `}>
      {symbols[currency as keyof typeof symbols] || currency.substring(0, 2)}
    </div>
  );
};

export default CurrencyIcon;
