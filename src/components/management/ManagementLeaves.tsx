import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { LeaveApplication } from '../../types';

export const ManagementLeaves: React.FC = () => {
  const { leaveApplications, verifyLeaveParent, reviewLeaveApplication } = useHostel();

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [parentNotes, setParentNotes] = useState('');
  const [rectorRemarks, setRectorRemarks] = useState('');
  const [isVerifyingParent, setIsVerifyingParent] = useState(false);

  const filteredLeaves = leaveApplications.filter((l) => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

  const handleVerifyParent = (leaveId: string) => {
    verifyLeaveParent(leaveId, parentNotes.trim() || 'Parent contacted via phone call and approved departure.');
    setIsVerifyingParent(false);
    setParentNotes('');
  };

  const handleReview = (leaveId: string, status: 'Approved' | 'Rejected') => {
    reviewLeaveApplication(leaveId, status, rectorRemarks.trim() || undefined);
    setSelectedLeave(null);
    setRectorRemarks('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Leave Applications
          </h2>
          <p className="text-sm md:text-base text-[#434655] mt-1">
            Review student out-of-hostel requests, contact parents for verification, and grant gate passes.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === st
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st} ({leaveApplications.filter((l) => st === 'All' || l.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2 block">flight_takeoff</span>
            No leave applications under category: {filter}.
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#121b2e]">
                      {leave.studentName}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e9edff] text-[#004ac6] font-semibold">
                      Room {leave.roomNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Applied: {leave.appliedAt}</p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold self-start sm:self-auto ${
                    leave.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : leave.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {leave.status}
                </span>
              </div>

              {/* Date & Reason */}
              <div className="bg-[#f9f9ff] p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#004ac6]">
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  <span>
                    Leave Duration: {leave.dateFrom} &nbsp;→&nbsp; {leave.dateTo}
                  </span>
                </div>
                <p className="text-sm text-[#434655] leading-relaxed">
                  <strong>Reason:</strong> {leave.reason}
                </p>
              </div>

              {/* Parent Verification Box */}
              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    leave.parentVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {leave.parentVerified ? 'phone_enabled' : 'phone_in_talk'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Parent Contact: {leave.parentPhone}
                      </span>
                      {leave.parentVerified ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified ✓
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {leave.parentVerificationNotes || 'Call parent to confirm safety & authorization'}
                    </p>
                  </div>
                </div>

                {!leave.parentVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeave(leave);
                      setIsVerifyingParent(true);
                      setParentNotes(`Spoke with parent on ${new Date().toLocaleDateString()}. Approved.`);
                    }}
                    className="px-3.5 py-1.5 border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Verify with Parent
                  </button>
                )}
              </div>

              {leave.managementRemarks && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                  <span className="font-bold text-slate-900">Rector Remarks: </span>
                  {leave.managementRemarks}
                </div>
              )}

              {/* Action Buttons */}
              {leave.status === 'Pending' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeave(leave);
                      setRectorRemarks('Parent could not be reached / unauthorized leave.');
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeave(leave);
                      setRectorRemarks('Approved. Student must return by 8:00 PM.');
                    }}
                    className="px-5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Verify Parent Modal */}
      {isVerifyingParent && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">
              Verify with Parent
            </h4>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-slate-800">
              <p><strong>Student:</strong> {selectedLeave.studentName} (Room {selectedLeave.roomNumber})</p>
              <p><strong>Parent Phone:</strong> {selectedLeave.parentPhone}</p>
              <p><strong>Requested Dates:</strong> {selectedLeave.dateFrom} to {selectedLeave.dateTo}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Call Log Notes:
              </label>
              <textarea
                value={parentNotes}
                onChange={(e) => setParentNotes(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                placeholder="Spoke with parent, confirmed reason and departure dates..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyingParent(false)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerifyParent(selectedLeave.id)}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                Mark Parent Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {selectedLeave && !isVerifyingParent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">
              Review Leave for {selectedLeave.studentName}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rector Gate Pass Remarks:
              </label>
              <textarea
                value={rectorRemarks}
                onChange={(e) => setRectorRemarks(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                placeholder="Instructions or conditions for departure..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReview(selectedLeave.id, 'Rejected')}
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReview(selectedLeave.id, 'Approved')}
                className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6]"
              >
                Approve & Grant Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
