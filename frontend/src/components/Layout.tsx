import React from 'react';
import Container from './Container';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  header, 
  footer, 
  className = '',
  currentPage,
  onNavigate
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 flex ${className}`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar current={currentPage} onNavigate={onNavigate} />
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-kcb-primary to-kcb-secondary border-b border-green-200 z-40">
        <div className="flex items-center justify-center h-16 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-kcb-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">Treasury</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Desktop Header */}
        {header && (
          <header className="hidden md:block sticky top-0 z-40">
            {header}
          </header>
        )}
        
        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <Container maxWidth="xl">
            {children}
          </Container>
        </main>
        
        {/* Desktop Footer */}
        {footer && (
          <footer className="hidden md:block fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 z-40">
            {footer}
          </footer>
        )}
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default Layout;
