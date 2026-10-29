import React from 'react';
import { useHostel } from '../../context/HostelContext';

export const BottomNav: React.FC = () => {
  const { role, activeTab, setActiveTab } = useHostel();
  const isManagement = role === 'management';

  return (
    <nav className="md:hidden bg-white border-t border-[#c3c6d7] shadow-lg fixed bottom-0 w-full z-40 flex justify-around items-center px-2 py-1.5 rounded-t-xl overflow-x-auto">
      {isManagement ? (
        <>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[50px] ${
              activeTab === 'dashboard'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' ? 'filled' : ''}`}>
              dashboard
            </span>
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[50px] ${
              activeTab === 'rooms'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'rooms' ? 'filled' : ''}`}>
              meeting_room
            </span>
            <span className="text-[10px] mt-0.5">Rooms</span>
          </button>

          <button
            onClick={() => setActiveTab('mess')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[50px] ${
              activeTab === 'mess'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'mess' ? 'filled' : ''}`}>
              restaurant
            </span>
            <span className="text-[10px] mt-0.5">Mess</span>
          </button>

          <button
            onClick={() => setActiveTab('petitions')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[50px] ${
              activeTab === 'petitions'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'petitions' ? 'filled' : ''}`}>
              description
            </span>
            <span className="text-[10px] mt-0.5">Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all min-w-[50px] ${
              activeTab === 'leaves'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'leaves' ? 'filled' : ''}`}>
              flight_takeoff
            </span>
            <span className="text-[10px] mt-0.5">Leaves</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${activeTab === 'dashboard' ? 'filled' : ''}`}>
              home
            </span>
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('mess')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              activeTab === 'mess'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${activeTab === 'mess' ? 'filled' : ''}`}>
              lunch_dining
            </span>
            <span className="text-[10px] mt-0.5">Mess</span>
          </button>

          <button
            onClick={() => setActiveTab('petitions')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              activeTab === 'petitions'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${activeTab === 'petitions' ? 'filled' : ''}`}>
              assignment
            </span>
            <span className="text-[10px] mt-0.5">Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              activeTab === 'problems'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${activeTab === 'problems' ? 'filled' : ''}`}>
              report_problem
            </span>
            <span className="text-[10px] mt-0.5">Problems</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
              activeTab === 'attendance'
                ? 'bg-[#2563eb] text-white font-semibold'
                : 'text-[#434655] hover:text-[#004ac6]'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${activeTab === 'attendance' ? 'filled' : ''}`}>
              how_to_reg
            </span>
            <span className="text-[10px] mt-0.5">Attendance</span>
          </button>
        </>
      )}
    </nav>
  );
};
