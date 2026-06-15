'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Bike, Sliders, LayoutDashboard, Calendar, Layers, 
  Bell, Power, ShieldCheck, Sparkles, RefreshCw, Smartphone, 
  HelpCircle, UserCheck, Heart, ArrowRight, User, LogOut 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import CustomerDashboard from '@/components/CustomerDashboard';
import BusinessDashboard from '@/components/BusinessDashboard';
import AuthScreen from '@/components/AuthScreen';

export default function Page() {
  const { 
    currentUser, logout, isOffline, toggleOfflineMode, viewMode, setViewMode, 
    activeSection, setActiveSection, offlineQueue, notifications 
  } = useAppStore();

  const [heroDismissed, setHeroDismissed] = React.useState(false);

  // Force business dashboard for center admins
  React.useEffect(() => {
    if (currentUser && currentUser.role === 'center_admin' && viewMode === 'customer') {
      setViewMode('owner');
    }
  }, [currentUser, viewMode, setViewMode]);

  // Authentication gate
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Unread alerts badge
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const isManagerOrAdmin = currentUser.role === 'center_admin' || currentUser.role === 'app_admin';
  const canSwitchViews = currentUser.role === 'app_admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="washbook-applet-root">
      
      {/* GLOBAL SAAS NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Brand & Mode Display */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-200">
            WD
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-slate-900 tracking-tight text-sm md:text-base">WashBook</span>
              <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200/50 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                {currentUser.role === 'customer' ? 'Client App' : currentUser.role === 'center_admin' ? 'Managed Hub' : 'SaaS Master'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">Car & Bike Wash Detailing Platform</p>
          </div>
        </div>

        {/* Global Controllers row */}
        <div className="flex items-center gap-3">
          
          {/* OFFLINE/ONLINE SIMULATED CONNECTION SWITCH */}
          {currentUser.role !== 'customer' && (
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={toggleOfflineMode}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all flex items-center gap-1 leading-none ${
                  !isOffline 
                    ? 'bg-emerald-500 text-white shadow-xs' 
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}
                title="Simulate online server synchronizations"
              >
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="hidden sm:inline">ONLINE</span>
              </button>
              <button
                onClick={toggleOfflineMode}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all flex items-center gap-1 leading-none ${
                  isOffline 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}
                title="Simulate offline database state queuing"
              >
                <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">OFFLINE</span>
              </button>
            </div>
          )}

          {canSwitchViews && (
            <>
              <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

              {/* DUAL ROLE MANAGER SWITCH Perspective (Only displayed for app admins) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
                <button
                  onClick={() => setViewMode('customer')}
                  className={`px-2.5 py-1 font-bold rounded-lg transition-all flex items-center gap-1 ${
                    viewMode === 'customer' 
                      ? 'bg-white text-blue-600 shadow-xs font-black' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span className="hidden sm:inline">Client View</span>
                </button>
                <button
                  onClick={() => setViewMode('owner')}
                  className={`px-2.5 py-1 font-bold rounded-lg transition-all flex items-center gap-1 ${
                    viewMode === 'owner' 
                      ? 'bg-white text-slate-800 shadow-xs font-black' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span className="hidden sm:inline">Console</span>
                </button>
              </div>
            </>
          )}

          {/* Quick Sign Out for Mobile Header */}
          <button
            onClick={() => logout()}
            className="p-2 text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-xl transition-all sm:hidden"
            title="Log out of WashDash"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE HERO SECTION (Headline, Subtitle, CTA and visual alignment) */}
      {!heroDismissed && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white py-8 px-6 md:px-12 text-center relative overflow-hidden" id="saas-hero">
          {/* Ambient circles */}
          <div className="absolute top-0 left-0 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-1 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>SaaS Car & Bike Care Ecosystem</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-dense">
              Streamline Commutes. Book Professional detailing slots effortlessly.
            </h1>
            
            <p className="text-xs md:text-sm text-blue-100 max-w-lg mx-auto font-normal leading-relaxed">
              Experience dynamic offline-caching, auto-billing invoices, interactive real-time trackers, and deep business analytics dashboards inside one cohesive sandbox environment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setViewMode('customer');
                  setActiveSection('book');
                  setHeroDismissed(true);
                }}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs md:text-sm rounded-xl transition-all shadow-md shadow-black/10 flex items-center gap-1.5 group"
              >
                <span>Book Slot Now</span>
                <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform" />
              </button>
              {isManagerOrAdmin && (
                <button
                  onClick={() => {
                    setViewMode('owner');
                    setHeroDismissed(true);
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs md:text-sm rounded-xl transition-colors"
                >
                  Monitor Business Analytics
                </button>
              )}
              <button
                onClick={() => setHeroDismissed(true)}
                className="text-xs text-blue-200 hover:text-white transition-colors underline font-medium"
              >
                Dismiss Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE APPLICATION BODY GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDE BAR CORE NAVIGATION (Active on Desktop/Tablet viewports) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between md:h-[calc(100vh-140px)] md:sticky md:top-24" id="sidebar-navigation">
          
          <div className="space-y-6">
            
            {/* Context identity showcase card */}
            <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs text-center space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                {viewMode === 'customer' ? <Smartphone className="w-5.5 h-5.5" /> : <LayoutDashboard className="w-5.5 h-5.5" />}
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-mono">Current Context</span>
                <h4 className="text-xs font-black text-slate-800 truncate">
                  {viewMode === 'customer' ? 'Car & Bike Wash Client' : 'Operations Terminal'}
                </h4>
              </div>
            </div>

            {/* Main sidebar menu selection panel */}
            <div className="bg-white rounded-3xl border border-gray-100 p-2.5 shadow-3xs">
              <nav className="space-y-1">
                {viewMode === 'customer' ? (
                  <>
                    <button
                      onClick={() => setActiveSection('book')}
                      className={`w-full px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-3 justify-between transition-all ${
                        activeSection === 'book' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4" />
                        <span>Book Premium Wash</span>
                      </div>
                      <Sparkles className={`w-3.5 h-3.5 ${activeSection === 'book' ? 'text-yellow-300' : 'text-slate-300'}`} />
                    </button>

                    <button
                      onClick={() => setActiveSection('my-bookings')}
                      className={`w-full px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-3 justify-between transition-all ${
                        activeSection === 'my-bookings' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4" />
                        <span>Your Appointments</span>
                      </div>
                      {offlineQueue.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveSection('subscriptions')}
                      className={`w-full px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-3 justify-between transition-all ${
                        activeSection === 'subscriptions' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="w-4 h-4" />
                        <span>Detailing Subscriptions</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
                    </button>

                    <button
                      onClick={() => setActiveSection('notifications')}
                      className={`w-full px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-3 justify-between transition-all ${
                        activeSection === 'notifications' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4" />
                        <span>Alerts Center</span>
                      </div>
                      {unreadNotifCount > 0 && (
                        <span className="bg-red-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full">
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setActiveSection('vehicles')}
                      className={`w-full px-4 py-3 text-xs font-bold rounded-xl flex items-center gap-3 justify-between transition-all ${
                        activeSection === 'vehicles' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4" />
                        <span>Manage Vehicles</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center space-y-2 text-xs text-slate-400">
                    <LayoutDashboard className="w-5 h-5 mx-auto text-slate-400 animate-pulse" />
                    <p className="font-extrabold text-slate-800">Console Navigation</p>
                    <p className="text-[10px] leading-relaxed">Please direct your configuration variables using the tab selectors on the dashboard body.</p>
                  </div>
                )}
              </nav>
            </div>
          </div>

          {/* Connected User Profile Signout Card */}
          <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs space-y-3.5 hidden md:block" id="connected-user-panel">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-white text-xs">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-black text-slate-800 truncate">{currentUser.name}</h5>
                <p className="text-[9px] text-slate-400 truncate capitalize font-bold tracking-wider">
                  {currentUser.role === 'customer' ? '💎 Premium Client' : currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => logout()}
              className="w-full py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-[10px] rounded-xl border border-rose-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Securely</span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE DETAILED ROUTER PANEL */}
        <div className="flex-1 min-w-0" id="active-perspective-workspace">
          {viewMode === 'customer' ? (
            <CustomerDashboard />
          ) : (
            <BusinessDashboard />
          )}
        </div>
      </main>

      {/* MOBILE BAR NAVIGATION FOOTER PANEL */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 py-2 px-4 shadow-lg flex justify-around md:hidden">
        {viewMode === 'customer' ? (
          <>
            <button
              onClick={() => setActiveSection('book')}
              className={`flex flex-col items-center p-1.5 transition-colors ${
                activeSection === 'book' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-1">Book Wash</span>
            </button>
            <button
              onClick={() => setActiveSection('my-bookings')}
              className={`flex flex-col items-center p-1.5 transition-colors relative ${
                activeSection === 'my-bookings' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {offlineQueue.length > 0 && (
                <div className="absolute top-1 right-2 w-2 h-2 bg-amber-500 rounded-full"></div>
              )}
              <span className="text-[9px] font-bold mt-1">Bookings</span>
            </button>
            <button
              onClick={() => setActiveSection('subscriptions')}
              className={`flex flex-col items-center p-1.5 transition-colors ${
                activeSection === 'subscriptions' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-1">Passes</span>
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`flex flex-col items-center p-1.5 transition-colors relative ${
                activeSection === 'notifications' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <div className="absolute top-1.5 right-2 bg-red-500 text-[8px] font-extrabold text-white px-1 rounded-full">{unreadNotifCount}</div>
              )}
              <span className="text-[9px] font-bold mt-1">Alerts</span>
            </button>
          </>
        ) : (
          <div className="text-center text-[10px] text-slate-500 py-2 font-extrabold uppercase tracking-widest">
            📊 Owner Console Active (Switch mode top of screen)
          </div>
        )}
      </footer>
    </div>
  );
}
