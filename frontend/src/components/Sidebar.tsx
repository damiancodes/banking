import React, { useEffect, useState } from 'react';

interface SidebarProps {
  current: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ current, onNavigate }) => {
  const [isDark, setIsDark] = useState(false);

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
        <div className="flex items-center justify-center h-20 border-b border-green-700 dark:border-kcb-light bg-gradient-to-r from-kcb-primary to-kcb-secondary dark:from-kcb-dark dark:to-kcb-primary">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Treasury Logo" className="w-10 h-10 rounded-lg shadow-md bg-white object-contain" />
            <span className="text-lg font-semibold text-white dark:text-kcb-light">Treasury</span>
          </div>
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
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center p-2 mb-2 rounded-full border transition-all shadow
            ${isDark ? 'bg-kcb-dark text-kcb-light border-kcb-primary' : 'bg-white text-kcb-primary border-kcb-light'}
            hover:scale-105`}
          title="Toggle dark mode"
        >
          <span className="sr-only">Toggle dark mode</span>
          {isDark ? (
            <svg className="w-6 h-6 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        <div className="bg-white dark:bg-kcb-primary rounded-lg p-4 border border-gray-200 dark:border-kcb-dark shadow">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-kcb-primary dark:bg-kcb-dark rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white dark:text-kcb-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-kcb-primary dark:text-kcb-light">Treasury Manager</p>
              <p className="text-xs text-gray-600 dark:text-kcb-light">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 