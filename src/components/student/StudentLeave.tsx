import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';

export const StudentLeave: React.FC = () => {
  const { currentStudent, submitLeaveApplication, leaveApplications } = useHostel();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState(currentStudent.parentPhone || '');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFrom || !dateTo || !reason.trim() || !parentPhone.trim()) return;

    submitLeaveApplication({
      dateFrom,
      dateTo,
      reason: reason.trim(),
      parentPhone: parentPhone.trim(),
    });

    setDateFrom('');
    setDateTo('');
    setReason('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const myLeaves = leaveApplications.filter((l) => l.studentId === currentStudent.id);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
          Apply for Leave
        </h2>
        <p className="text-sm md:text-base text-[#434655] mt-1">
          Submit your leave request for approval by the hostel administration.
        </p>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 filled">check_circle</span>
          <div>
            <p className="font-semibold">Leave Application Submitted!</p>
            <p className="text-xs text-emerald-700">
              Forwarded to Rector Office. Parent verification call may be initiated before granting gate pass.
            </p>
          </div>
        </div>
      )}

      {/* Form Card matching Stitch design */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-[#121b2e]" htmlFor="date_from">
                Date From
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737686]">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                </div>
                <input
                  id="date_from"
                  type="date"
                  required
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#c3c6d7] rounded-lg text-sm bg-white text-[#121b2e] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-[#121b2e]" htmlFor="date_to">
                Date To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737686]">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <input
                  id="date_to"
                  type="date"
                  required
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#c3c6d7] rounded-lg text-sm bg-white text-[#121b2e] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-[#121b2e]" htmlFor="reason">
              Reason for Leave
            </label>
            <textarea
              id="reason"
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for your leave request (e.g. Family function, medical checkup, weekend home visit)..."
              className="block w-full px-4 py-2.5 border border-[#c3c6d7] rounded-lg text-sm bg-white text-[#121b2e] placeholder-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all resize-y"
            />
          </div>

          {/* Parent/Guardian Phone */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-[#121b2e]" htmlFor="parent_phone">
              Parent/Guardian Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737686]">
                <span className="material-symbols-outlined text-lg">phone</span>
              </div>
              <input
                id="parent_phone"
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-3 py-2.5 border border-[#c3c6d7] rounded-lg text-sm bg-white text-[#121b2e] placeholder-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-[#434655] mt-1">
              For emergency contact and verification purposes. The rector office calls this number to verify unexcused leaves.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setReason('');
              }}
              className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563eb] text-white text-sm font-semibold rounded-lg hover:bg-[#004ac6] transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Submit Application
            </button>
          </div>
        </form>
      </div>

      {/* Leave Application History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#121b2e]">
          My Leave History ({myLeaves.length})
        </h3>

        {myLeaves.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No previous leave applications recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {myLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">date_range</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {leave.dateFrom} &nbsp;→&nbsp; {leave.dateTo}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
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

                <p className="text-xs text-[#434655] leading-relaxed">
                  <strong>Reason:</strong> {leave.reason}
                </p>

                {leave.parentVerified && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-max">
                    <span className="material-symbols-outlined text-sm filled">check_circle</span>
                    <span>Parent Verified ({leave.parentPhone})</span>
                  </div>
                )}

                {leave.managementRemarks && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                    <span className="font-bold text-slate-900">Rector Remarks: </span>
                    {leave.managementRemarks}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Applied: {leave.appliedAt}</span>
                  {leave.reviewedAt && <span>Reviewed: {leave.reviewedAt}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
