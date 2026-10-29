import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';

interface TopAppBarProps {
  onToggleMobileMenu?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onToggleMobileMenu }) => {
  const {
    role,
    currentStudent,
    managementProfile,
    logout,
    unreadNotificationsCount,
    activeTab,
    setActiveTab,
  } = useHostel();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isManagement = role === 'management';
  const isVisitor = role === 'visitor';
  const displayName = isManagement ? (managementProfile.name || 'Rector') : isVisitor ? 'Visitor' : (currentStudent.name || 'Student');

  return (
    <header className="bg-white border-b border-[#c3c6d7] flex justify-between items-center px-4 md:px-8 h-16 w-full z-40 sticky top-0 shrink-0">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Menu"
            className="md:hidden text-[#004ac6] hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-semibold text-[#004ac6] tracking-wider uppercase">KKWIEER</span>
          <h1 className="text-sm md:text-lg font-bold text-[#121b2e] tracking-tight truncate">HOSTEL MANAGEMENT SYSTEM</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {!isVisitor && (
          <button
            onClick={() => setActiveTab('notifications')}
            aria-label="Notifications"
            className={`p-2 rounded-full hover:bg-slate-100 transition-colors relative flex items-center justify-center ${activeTab === 'notifications' ? 'text-[#004ac6] bg-blue-50' : 'text-slate-700'}`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'notifications' ? 'filled' : ''}`}>notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((shown) => !shown)}
            aria-expanded={showProfileMenu}
            aria-label="Account details"
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <span className="w-8 h-8 rounded-full border border-slate-300 bg-slate-100 text-slate-600 flex items-center justify-center overflow-hidden">
              {(isManagement ? managementProfile.avatar : currentStudent.avatar) ? <img src={(isManagement ? managementProfile.avatar : currentStudent.avatar)} alt="Profile" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-xl">{isManagement ? 'admin_panel_settings' : 'person'}</span>}
            </span>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">{displayName}</span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {isManagement ? 'Rector' : isVisitor ? 'Visitor' : `Room ${currentStudent.roomNumber}`}
              </span>
            </div>
            <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-blue-600 font-medium">
                  {isManagement
                    ? `${managementProfile.designation}${managementProfile.email ? ` · ${managementProfile.email}` : ''}`
                    : isVisitor
                      ? 'Read-only visitor access'
                      : `${currentStudent.name} • ${currentStudent.course} • Room ${currentStudent.roomNumber}`}
                </p>
                {!isVisitor && (
                  <button
                    onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                    className="mt-3 w-full text-left px-2 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded font-medium flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">person</span> My Profile
                  </button>
                )}
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                className="mt-2 w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">logout</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
