import React from 'react';
import { useHostel } from '../../context/HostelContext';

export const Sidebar: React.FC = () => {
  const {
    role,
    currentStudent,
    managementProfile,
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    activeRequestsCount,
    pendingProblemsCount,
    pendingLeavesCount,
  } = useHostel();

  const isManagement = role === 'management';
  const currentUser = isManagement ? managementProfile : currentStudent;

  return (
    <aside
      aria-label="Sidebar"
      className="hidden md:flex flex-col bg-white text-[#004ac6] w-64 h-[calc(100vh-64px)] sticky top-16 z-30 p-4 border-r border-[#c3c6d7] shadow-sm shrink-0 overflow-y-auto"
    >
      {/* Profile Header matching Stitch screen */}
      <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-[#f1f3ff] border border-slate-200/60 text-left">
        <span className="w-12 h-12 rounded-full border border-slate-300 bg-white text-slate-500 flex items-center justify-center shrink-0 overflow-hidden">{currentUser.avatar ? <img src={currentUser.avatar} alt="Profile" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-2xl">{isManagement ? 'admin_panel_settings' : 'person'}</span>}</span>
        <div className="overflow-hidden">
          <h2 className="font-semibold text-sm text-[#121b2e] truncate">
            {currentUser.name || (isManagement ? 'Rector Profile' : 'Student')}
          </h2>
          <p className="text-xs text-[#434655] truncate">
            {isManagement
              ? 'Hostel Administrator'
              : `Room ${currentStudent.roomNumber} (${currentStudent.bed})`}
          </p>
        </div>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 font-medium text-sm">
        {isManagement ? (
          // MANAGEMENT NAV
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'dashboard' ? 'filled' : ''}`}>
                  dashboard
                </span>
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'rooms'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'rooms' ? 'filled' : ''}`}>
                  meeting_room
                </span>
                <span>Room Overview</span>
              </div>
              {pendingProblemsCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  {pendingProblemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('mess')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'mess'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'mess' ? 'filled' : ''}`}>
                  restaurant
                </span>
                <span>Mess Operations</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('petitions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'petitions'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'petitions' ? 'filled' : ''}`}>
                  description
                </span>
                <span>Active Requests</span>
              </div>
              {activeRequestsCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  {activeRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'leaves'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'leaves' ? 'filled' : ''}`}>
                  flight_takeoff
                </span>
                <span>Leave Applications</span>
              </div>
              {pendingLeavesCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  {pendingLeavesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'students'
                  ? 'bg-[#fee2e2] text-red-800 font-semibold'
                  : 'text-[#434655] hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'students' ? 'filled' : ''}`}>groups</span>
                <span>List of Students</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'notifications' ? 'filled' : ''}`}>
                  notifications
                </span>
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </>
        ) : (
          // STUDENT NAV
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'dashboard' ? 'filled' : ''}`}>
                dashboard
              </span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('mess')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'mess'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'mess' ? 'filled' : ''}`}>
                restaurant
              </span>
              <span>Mess</span>
            </button>

            <button
              onClick={() => setActiveTab('petitions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'petitions'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'petitions' ? 'filled' : ''}`}>
                description
              </span>
              <span>Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('problems')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'problems'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'problems' ? 'filled' : ''}`}>
                report_problem
              </span>
              <span>Room Problems</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'attendance'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'attendance' ? 'filled' : ''}`}>
                how_to_reg
              </span>
              <span>Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('leave')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'leave'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${activeTab === 'leave' ? 'filled' : ''}`}>
                flight_takeoff
              </span>
              <span>Leave Application</span>
            </button>

            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === 'profile' ? 'bg-[#dde1ff] text-[#00217a] font-semibold' : 'text-[#434655] hover:bg-[#e9edff]'}`}>
              <span className="material-symbols-outlined text-xl">person</span><span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === 'notifications'
                  ? 'bg-[#dde1ff] text-[#00217a] font-semibold'
                  : 'text-[#434655] hover:bg-[#e9edff] hover:text-[#121b2e]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${activeTab === 'notifications' ? 'filled' : ''}`}>
                  notifications
                </span>
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </>
        )}
      </nav>

      {/* Bottom Hostel Quick Info Card */}
      <div className="pt-4 border-t border-slate-200 mt-auto">
        <div className="bg-[#f9f9ff] p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
            <span className="material-symbols-outlined text-sm text-blue-600">call</span>
            <span>Hostel Help Desk</span>
          </div>
          <p className="text-[11px] text-slate-500">Rector Office: +1 (555) 999-1000</p>
          <p className="text-[11px] text-slate-500">Maintenance: Ext. 404</p>
        </div>
      </div>
    </aside>
  );
};
