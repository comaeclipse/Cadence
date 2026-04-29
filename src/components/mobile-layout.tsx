"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, TrendingUp, ChevronRight, Timer, UserCircle } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { StopwatchModal } from '@/components/ui/stopwatch-modal';
import { useAuth } from '@/lib/auth-context';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const NAV_ROUTES = ['/', '/calendar', '/reports', '/settings'];

export function MobileLayout({ children, title = "Behavior Tracker", subtitle = "Understanding patterns together" }: MobileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [stopwatchOpen, setStopwatchOpen] = React.useState(false);
  const { user } = useAuth();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = NAV_ROUTES.indexOf(pathname);
      if (currentIndex >= 0 && currentIndex < NAV_ROUTES.length - 1) {
        router.push(NAV_ROUTES[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = NAV_ROUTES.indexOf(pathname);
      if (currentIndex > 0) {
        router.push(NAV_ROUTES[currentIndex - 1]);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <div {...handlers} className="min-h-screen bg-stone-100 pb-20">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-emerald-600 transition-colors ml-4"
          aria-label="Account"
        >
          <UserCircle className="w-7 h-7" />
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-180px)]">
        {children}
      </div>

      {/* iOS Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-stone-200 safe-area-inset-bottom z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center py-2 ${
              pathname === '/' 
                ? 'text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className={`text-xs ${pathname === '/' ? 'font-medium' : ''}`}>Home</span>
          </Link>
          <Link 
            href="/calendar" 
            className={`flex flex-col items-center justify-center py-2 ${
              pathname === '/calendar' 
                ? 'text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar className="w-6 h-6 mb-1" />
            <span className={`text-xs ${pathname === '/calendar' ? 'font-medium' : ''}`}>Calendar</span>
          </Link>
          <button
            onClick={() => setStopwatchOpen(true)}
            className="flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600"
          >
            <Timer className="w-6 h-6 mb-1" />
            <span className="text-xs">Timer</span>
          </button>
          <Link 
            href="/reports" 
            className={`flex flex-col items-center justify-center py-2 ${
              pathname === '/reports' 
                ? 'text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className={`text-xs ${pathname === '/reports' ? 'font-medium' : ''}`}>Insights</span>
          </Link>
          <Link 
            href="/settings" 
            className={`flex flex-col items-center justify-center py-2 ${
              pathname === '/settings' 
                ? 'text-emerald-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ChevronRight className="w-6 h-6 mb-1" />
            <span className={`text-xs ${pathname === '/settings' ? 'font-medium' : ''}`}>More</span>
          </Link>
        </div>
      </div>

      <StopwatchModal open={stopwatchOpen} onOpenChange={setStopwatchOpen} />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

