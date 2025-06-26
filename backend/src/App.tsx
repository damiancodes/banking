import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Test KCB colors */}
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-kcb-primary text-white rounded-lg">
          ✅ KCB Primary Test - This should be GREEN (#2E7D32)
        </div>
        <div className="p-4 bg-kcb-secondary text-white rounded-lg">
          ✅ KCB Secondary Test - This should be LIGHTER GREEN (#388E3C)
        </div>
        <div className="p-4 bg-blue-600 text-white rounded-lg">
          ❌ Blue Test - This should be BLUE (for comparison)
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-kcb-primary mb-8">
          Treasury Movement Simulator
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">KES Accounts</h2>
            <p className="text-3xl font-bold text-currency-kes">KSh 225,000.00</p>
            <p className="text-sm text-gray-600">3 accounts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">USD Accounts</h2>
            <p className="text-3xl font-bold text-currency-usd">$ 25,000.00</p>
            <p className="text-sm text-gray-600">4 accounts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">NGN Accounts</h2>
            <p className="text-3xl font-bold text-currency-ngn">₦ 1,500,000.00</p>
            <p className="text-sm text-gray-600">3 accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
