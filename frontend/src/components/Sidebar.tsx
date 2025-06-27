import React, { useEffect, useState } from 'react';

interface SidebarProps {
  current: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ current, onNavigate }) => {
  const [isDark, setIsDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: 'transfer',
      label: 'Transfer Money',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      id: 'history',
      label: 'Transaction History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-kcb-primary dark:bg-kcb-dark shadow-lg z-50 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between h-20 border-b border-green-700 dark:border-kcb-light bg-gradient-to-r from-kcb-primary to-kcb-secondary dark:from-kcb-dark dark:to-kcb-primary px-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Treasury Logo" className="w-10 h-10 rounded-full shadow-md bg-white object-cover my-2" />
            <span className="text-lg font-semibold text-white dark:text-kcb-light">Treasury</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-white/30 bg-white/10 shadow hover:bg-kcb-primary/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-kcb-primary focus:ring-offset-2"
            title="Toggle dark mode"
          >
            <span className="sr-only">Toggle dark mode</span>
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 group
                  ${current === item.id
                    ? 'bg-white text-kcb-primary shadow font-bold dark:bg-kcb-dark dark:text-kcb-light'
                    : 'text-white hover:bg-white hover:text-kcb-primary dark:text-kcb-light dark:hover:bg-kcb-primary dark:hover:text-white'}
                `}
              >
                <span className={`group-hover:text-kcb-primary ${current === item.id ? 'text-kcb-primary dark:text-kcb-light' : 'text-white dark:text-kcb-light'}`}>{item.icon}</span>
                <span className={`group-hover:text-kcb-primary ${current === item.id ? 'text-kcb-primary dark:text-kcb-light' : 'text-white dark:text-kcb-light'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
      <div className="mb-8 px-4 flex flex-col gap-4">
        <button
          onClick={() => setShowProfile(true)}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-kcb-primary to-kcb-secondary text-white shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-kcb-primary focus:ring-offset-2 border-none mt-2"
          style={{ fontWeight: 600, fontSize: '1rem' }}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="flex flex-col items-start">
            <span className="leading-tight">Treasury Manager</span>
            <span className="text-xs text-white/80 font-normal">Administrator</span>
          </span>
        </button>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-fade-in">
              <button onClick={() => setShowProfile(false)} className="absolute top-3 right-3 text-gray-400 hover:text-kcb-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-kcb-primary flex items-center justify-center mb-2">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-kcb-primary mb-1">Treasury Manager</h2>
                <p className="text-sm text-gray-500 mb-2">Administrator</p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <button className="w-full py-2 rounded-lg bg-kcb-primary text-white font-semibold hover:bg-kcb-secondary transition">View Profile</button>
                  <button className="w-full py-2 rounded-lg bg-gray-100 text-kcb-primary font-semibold hover:bg-gray-200 transition">Log Out</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 