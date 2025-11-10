import { BarChart3, Activity, Menu } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';

interface NavbarProps {
  currentPage: 'dashboard' | 'activities';
  onNavigate: (page: 'dashboard' | 'activities') => void;
  rightContent?: React.ReactNode;
}

export function Navbar({ currentPage, onNavigate, rightContent }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'activities' as const, label: 'Activities', icon: Activity },
  ];

  const handleNavigate = (page: 'dashboard' | 'activities') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3" style={{ marginLeft: '-20px' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 shadow-sm">
              <BarChart3 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="tracking-tight" style={{ fontSize: '20px', fontWeight: 600 }}>
              <span className="text-gray-900">AI Twin </span>
              <span style={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Analytics
              </span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      relative inline-flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-gray-900 bg-gray-100 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 h-0.5 w-12 bg-gradient-to-r from-transparent via-gray-900 to-transparent rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            {rightContent && (
              <>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="flex items-center">
                  {rightContent}
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`
                          relative inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all text-left w-full
                          ${isActive 
                            ? 'text-gray-900 bg-gray-100 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                        {item.label}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gray-900 rounded-r-full" />
                        )}
                      </button>
                    );
                  })}
                  {rightContent && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {rightContent}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
