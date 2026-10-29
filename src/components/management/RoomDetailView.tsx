import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { RoomProblem, ProblemStatus } from '../../types';

interface RoomDetailViewProps {
  roomNumber: string;
  onBack: () => void;
}

export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ roomNumber, onBack }) => {
  const {
    rooms,
    students,
    roomProblems,
    leaveApplications,
    updateProblemStatus,
    reviewLeaveApplication,
    setActiveTab,
  } = useHostel();

  const [assigningProblemId, setAssigningProblemId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [resolvingProblemId, setResolvingProblemId] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  const room = rooms.find((r) => r.roomNumber === roomNumber);

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Room data unavailable</h2>
        <p className="mt-2 text-sm text-slate-500">No room records have been loaded from Supabase yet.</p>
        <button onClick={onBack} className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to rooms</button>
      </div>
    );
  }

  const residents = students.filter((s) => s.roomNumber === roomNumber);
  const problems = roomProblems.filter((p) => p.roomNumber === roomNumber);
  const activeLeaves = leaveApplications.filter(
    (l) => l.roomNumber === roomNumber && (l.status === 'Pending' || l.status === 'Approved')
  );

  const presentCount = residents.filter((r) => r.todayAttendance === 'Present').length;
  const activeProblemsCount = problems.filter((p) => p.status !== 'Resolved').length;

  const handleAssign = (problemId: string) => {
    updateProblemStatus(problemId, 'Assigned', staffName);
    setAssigningProblemId(null);
  };

  const handleResolve = (problemId: string) => {
    updateProblemStatus(problemId, 'Resolved', undefined, resolutionRemarks);
    setResolvingProblemId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header matching Stitch Room 203 View */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center"
            title="Back to Room Overview"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Room {roomNumber}
              </h2>
              <span className="text-xs px-3 py-1 bg-[#e9edff] text-[#004ac6] font-bold rounded-full">
                Floor {room.floor} • {room.block}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Hostel Rector Detailed Monitoring View
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700"
        >
          Close View
        </button>
      </div>

      {/* Overview Stat Cards matching Stitch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Attendance Overview Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-[#004ac6] text-2xl font-bold tabular-nums shrink-0">
            {presentCount}/{residents.length}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance Overview</h3>
            <p className="text-xs text-[#434655] mt-1">
              {presentCount} student{presentCount === 1 ? '' : 's'} present today,{' '}
              {residents.length - presentCount} marked absent or on leave.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Daily verified count</span>
            </div>
          </div>
        </div>

        {/* Active Problems Card */}
        <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 ${
            activeProblemsCount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <span className="material-symbols-outlined text-3xl">
              {activeProblemsCount > 0 ? 'report_problem' : 'task_alt'}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Problems</h3>
            <p className="text-xs text-[#434655] mt-1">
              {activeProblemsCount} maintenance issue{activeProblemsCount === 1 ? '' : 's'} reported for this room.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`inline-block w-2 h-2 rounded-full ${activeProblemsCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-slate-600 font-medium">
                {activeProblemsCount > 0 ? 'Requires maintenance attention' : 'All fixtures functional'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Residents Section matching Stitch */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Residents</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            Capacity: {residents.length}/{room.capacity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {residents.map((resident) => {
            const pendingLeave = leaveApplications.find(
              (l) => l.studentId === resident.id && l.status === 'Pending'
            );
            const activeApprovedLeave = leaveApplications.find(
              (l) => l.studentId === resident.id && l.status === 'Approved'
            );

            return (
              <div
                key={resident.id}
                className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Avatar with Status badge */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                  <span className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined">person</span></span>
                  
                  {/* Status chip */}
                  <div className="absolute top-3 right-3">
                    {resident.todayAttendance === 'Present' ? (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs filled">check_circle</span>
                        Present
                      </span>
                    ) : resident.todayAttendance === 'Leave' ? (
                      <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs filled">flight</span>
                        On Leave
                      </span>
                    ) : (
                      <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs filled">cancel</span>
                        Absent
                      </span>
                    )}
                  </div>
                </div>

                {/* Resident Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{resident.name}</h4>
                    <p className="text-xs text-[#434655] mt-0.5 mb-3">
                      {resident.bed} • {resident.course} ({resident.year})
                    </p>

                    <div className="space-y-1 text-xs text-slate-500 bg-[#f9f9ff] p-2.5 rounded-lg border border-slate-100 mb-3">
                      <p><strong>Roll:</strong> {resident.rollNumber}</p>
                      <p><strong>Phone:</strong> {resident.phone}</p>
                      <p><strong>Parent:</strong> {resident.parentName} ({resident.parentPhone})</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {pendingLeave ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">pending_actions</span>
                        1 Leave Pending
                      </span>
                    ) : activeApprovedLeave ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">flight_takeoff</span>
                        Leave Approved
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        0 Active Leaves
                      </span>
                    )}

                    {pendingLeave && (
                      <button
                        onClick={() => setActiveTab('leaves')}
                        className="text-[#004ac6] font-bold hover:underline"
                      >
                        Review Leave
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Problems Section matching Stitch */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-slate-900">
          Room Problems & Work Orders ({problems.length})
        </h3>

        {problems.length === 0 ? (
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 block">task_alt</span>
            No maintenance problems recorded for Room {roomNumber}.
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((prob) => (
              <div
                key={prob.id}
                className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-12 w-12 rounded-full bg-[#e9edff] flex items-center justify-center text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      {prob.category === 'Fan'
                        ? 'mode_fan'
                        : prob.category === 'Light'
                        ? 'lightbulb'
                        : prob.category === 'Water'
                        ? 'water_drop'
                        : prob.category === 'Furniture'
                        ? 'chair'
                        : 'build'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-slate-900">{prob.title}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          prob.status === 'Pending'
                            ? 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]'
                            : prob.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prob.status}
                      </span>
                    </div>

                    <p className="text-sm text-[#434655] max-w-2xl leading-relaxed">
                      {prob.description}
                    </p>

                    {prob.assignedStaff && (
                      <p className="text-xs text-blue-700 font-semibold mt-2">
                        Assigned: {prob.assignedStaff}
                      </p>
                    )}

                    {prob.rectorRemarks && (
                      <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold">Resolution Note: </span>
                        {prob.rectorRemarks}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-xs text-[#737686]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span>
                        Submitted by {prob.studentName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {prob.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Action Buttons matching Stitch */}
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                  {prob.status !== 'Resolved' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setAssigningProblemId(prob.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-[#c3c6d7] text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">build</span>
                        {prob.assignedStaff ? 'Reassign' : 'Assign'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolvingProblemId(prob.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-[#004ac6] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                        Resolve
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm filled">done_all</span>
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assigningProblemId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Assign Maintenance Staff</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technician / Staff Member:
              </label>
              <input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Enter assigned staff name"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssigningProblemId(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(assigningProblemId)}
                disabled={!staffName.trim()}
                className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolvingProblemId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Mark Problem as Resolved</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Remarks:
              </label>
              <textarea
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                rows={3}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Describe what was repaired..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingProblemId(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolvingProblemId)}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
