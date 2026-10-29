import React from 'react';
import { useHostel } from '../../context/HostelContext';

export const StudentDashboard: React.FC = () => {
  const {
    currentStudent,
    setActiveTab,
    messComplaints,
    petitions,
    roomProblems,
    leaveApplications,
  } = useHostel();

  const myComplaintsCount = messComplaints.filter((c) => c.studentId === currentStudent.id).length;
  const myRoomProblemsCount = roomProblems.filter((p) => p.roomNumber === currentStudent.roomNumber && p.status !== 'Resolved').length;
  const myPendingLeavesCount = leaveApplications.filter((l) => l.studentId === currentStudent.id && l.status === 'Pending').length;
  const activePetitionsCount = petitions.filter((p) => p.status === 'gathering_support' || p.status === 'active_management').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Page Header matching Stitch mockup */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
          Student Dashboard
        </h2>
        <p className="text-sm md:text-base text-[#434655] mt-1">
          Welcome back, {currentStudent.name || 'Student'}. Manage your hostel activities here.
        </p>
      </div>

      {/* Student Profile Quick Banner */}
      <div className="bg-white border border-[#c3c6d7] rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined text-3xl">person</span></span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{currentStudent.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Room {currentStudent.roomNumber} ({currentStudent.bed})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll: {currentStudent.rollNumber} • {currentStudent.course} ({currentStudent.year})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Attendance Status</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              currentStudent.todayAttendance === 'Present'
                ? 'bg-emerald-100 text-emerald-800'
                : currentStudent.todayAttendance === 'Leave'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <span className="material-symbols-outlined text-xs filled">
                {currentStudent.todayAttendance === 'Present' ? 'check_circle' : currentStudent.todayAttendance === 'Leave' ? 'flight' : 'cancel'}
              </span>
              Today: {currentStudent.todayAttendance}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Overall Rate</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {currentStudent.attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Bento Grid (Matches Stitch layout exactly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Mess Card */}
        <div
          onClick={() => setActiveTab('mess')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">restaurant</span>
            </div>
            {myComplaintsCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {myComplaintsCount} logged
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#121b2e] mb-1 group-hover:text-[#2563eb] transition-colors">
              Mess
            </h3>
            <p className="text-sm text-[#434655]">
              Report food issues or view status
            </p>
          </div>
        </div>

        {/* Petitions Card */}
        <div
          onClick={() => setActiveTab('petitions')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activePetitionsCount} active
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#121b2e] mb-1 group-hover:text-[#2563eb] transition-colors">
              Requests
            </h3>
            <p className="text-sm text-[#434655]">
              Create or support requests
            </p>
          </div>
        </div>

        {/* Problems Card */}
        <div
          onClick={() => setActiveTab('problems')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">report_problem</span>
            </div>
            {myRoomProblemsCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {myRoomProblemsCount} active in room
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#121b2e] mb-1 group-hover:text-[#2563eb] transition-colors">
              Problems
            </h3>
            <p className="text-sm text-[#434655]">
              Report room maintenance issues
            </p>
          </div>
        </div>

        {/* Attendance Card */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer group md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">how_to_reg</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              currentStudent.todayAttendance === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentStudent.todayAttendance === 'Present' ? 'Verified Today' : 'Pending Selfie'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#121b2e] mb-1 group-hover:text-[#2563eb] transition-colors">
              Attendance
            </h3>
            <p className="text-sm text-[#434655]">
              Submit your daily live selfie
            </p>
          </div>
        </div>

        {/* Leave Application Card */}
        <div
          onClick={() => setActiveTab('leave')}
          className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all cursor-pointer group lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
            </div>
            {myPendingLeavesCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {myPendingLeavesCount} request pending
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#121b2e] mb-1 group-hover:text-[#2563eb] transition-colors">
              Leave Application
            </h3>
            <p className="text-sm text-[#434655]">
              Apply for hostel leave & gate pass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
