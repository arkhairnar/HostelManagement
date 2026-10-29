/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { HostelProvider, useHostel } from './context/HostelContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { TopAppBar } from './components/layout/TopAppBar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

// Student screens
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentMess } from './components/student/StudentMess';
import { StudentPetitions } from './components/student/StudentPetitions';
import { StudentProblems } from './components/student/StudentProblems';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentLeave } from './components/student/StudentLeave';
import { StudentProfilePage } from './components/student/StudentProfilePage';
import { RectorProfilePage } from './components/management/RectorProfilePage';

// Management screens
import { ManagementDashboard } from './components/management/ManagementDashboard';
import { ManagementMess } from './components/management/ManagementMess';
import { ManagementPetitions } from './components/management/ManagementPetitions';
import { ManagementLeaves } from './components/management/ManagementLeaves';
import { ManagementStudents } from './components/management/ManagementStudents';
import { VisitorDashboard } from './components/management/VisitorDashboard';
import { NotificationsScreen } from './components/notifications/NotificationsScreen';

const MainAppContent: React.FC = () => {
  const { role, isLoggedIn, activeTab, setActiveTab } = useHostel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lastHistoryTab = useRef<string | null>(null);

  React.useEffect(() => {
    // Seed one in-app history entry. Do not continually push on popstate:
    // that traps the Back button and can make navigation feel broken.
    if (!window.history.state?.hostelApp) {
      window.history.replaceState({ ...(window.history.state || {}), hostelApp: true, hostelTab: activeTab }, '', window.location.href);
    }
    lastHistoryTab.current = activeTab;

    const handlePopState = (event: PopStateEvent) => {
      const previousTab = event.state?.hostelTab;
      if (typeof previousTab === 'string') {
        lastHistoryTab.current = previousTab;
        setActiveTab(previousTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // Register the listener once; activeTab changes are handled in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (lastHistoryTab.current === null) {
      lastHistoryTab.current = activeTab;
      return;
    }
    if (lastHistoryTab.current !== activeTab) {
      window.history.pushState({ ...(window.history.state || {}), hostelApp: true, hostelTab: activeTab }, '', window.location.href);
      lastHistoryTab.current = activeTab;
    }
  }, [activeTab]);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderActiveScreen = () => {
    if (role === 'visitor') {
      return <ManagementDashboard />;
    }

    if (activeTab === 'profile') {
      return role === 'management' ? <RectorProfilePage /> : <StudentProfilePage />;
    }

    if (activeTab === 'notifications') {
      return <NotificationsScreen />;
    }

    if (role === 'management') {
      switch (activeTab) {
        case 'dashboard':
          return <ManagementDashboard mode="dashboard" />;
        case 'rooms':
          return <ManagementDashboard mode="rooms" />;
        case 'mess':
          return <ManagementMess />;
        case 'petitions':
          return <ManagementPetitions />;
        case 'leaves':
          return <ManagementLeaves />;
        case 'students':
          return <ManagementStudents />;
        default:
          return <ManagementDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'mess':
          return <StudentMess />;
        case 'petitions':
          return <StudentPetitions />;
        case 'problems':
          return <StudentProblems />;
        case 'attendance':
          return <StudentAttendance />;
        case 'leave':
          return <StudentLeave />;
        default:
          return <StudentDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#121b2e] flex flex-col font-['Inter'] antialiased">
      {/* Top App Bar */}
      <TopAppBar onToggleMobileMenu={role === 'visitor' ? undefined : () => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar */}
        {<Sidebar />}

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && role !== 'visitor' && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex">
            <div className="w-72 bg-white h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">
                      HMS
                    </span>
                    <span className="font-bold text-sm text-slate-900">Hostel Portal</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <div className="space-y-1">
                  {role === 'management' ? (
                    <>
                      <button
                        onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'dashboard' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">dashboard</span>
                        Dashboard
                      </button>
                      <button
                        onClick={() => { setActiveTab('rooms'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'rooms' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">meeting_room</span>
                        Room Overview
                      </button>
                      <button
                        onClick={() => { setActiveTab('mess'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'mess' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">restaurant</span>
                        Mess Operations
                      </button>
                      <button
                        onClick={() => { setActiveTab('petitions'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'petitions' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">description</span>
                        Active Requests
                      </button>
                      <button
                        onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'students' ? 'bg-red-100 text-red-800' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">groups</span>
                        List of Students
                      </button>
                      <button
                        onClick={() => { setActiveTab('leaves'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'leaves' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                        Leave Applications
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'dashboard' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">dashboard</span>
                        Dashboard
                      </button>
                      <button
                        onClick={() => { setActiveTab('mess'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'mess' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">restaurant</span>
                        Mess
                      </button>
                      <button
                        onClick={() => { setActiveTab('petitions'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'petitions' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">description</span>
                        Requests
                      </button>
                      <button
                        onClick={() => { setActiveTab('problems'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'problems' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">report_problem</span>
                        Room Problems
                      </button>
                      <button
                        onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'attendance' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">how_to_reg</span>
                        Attendance
                      </button>
                      <button
                        onClick={() => { setActiveTab('leave'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 ${activeTab === 'leave' ? 'bg-[#dde1ff] text-[#00217a]' : 'text-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                        Leave Application
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Academic Living System v2.0
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Canvas Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {role !== 'visitor' && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <HostelProvider>
      <MainAppContent />
    </HostelProvider>
  );
}
