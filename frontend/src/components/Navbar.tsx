import { Button } from './ui/button';
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
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-gray-900">AI Twin Analytics</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => handleNavigate(item.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'default' : 'ghost'}
                        onClick={() => handleNavigate(item.id)}
                        className="gap-2 justify-start"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
