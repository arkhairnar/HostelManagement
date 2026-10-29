import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { MessComplaint, MessStatus } from '../../types';

export const ManagementMess: React.FC = () => {
  const { messComplaints, updateMessStatus } = useHostel();

  const [statusFilter, setStatusFilter] = useState<'All' | MessStatus>('All');
  const [selectedIssue, setSelectedIssue] = useState<MessComplaint | null>(null);
  const [remarks, setRemarks] = useState('');

  const filteredComplaints = messComplaints.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const handleUpdate = (status: MessStatus) => {
    if (!selectedIssue) return;
    updateMessStatus(selectedIssue.id, status, remarks.trim() || undefined);
    setSelectedIssue(null);
    setRemarks('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header matching Stitch screen */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Mess Operations
          </h2>
          <p className="text-sm md:text-base text-[#434655] mt-1">
            Student-reported issues requiring management & kitchen attention.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {(['All', 'New', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List matching Stitch screen cards */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-2 block">restaurant</span>
            No complaints found under filter: {statusFilter}.
          </div>
        ) : (
          filteredComplaints.map((issue) => (
            <div
              key={issue.id}
              className="bg-white border border-[#c3c6d7] rounded-xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              {/* Photo Evidence Box */}
              <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-[#e9edff] flex items-center justify-center">
                {issue.photoUrl ? (
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-[#737686]">
                    restaurant_menu
                  </span>
                )}
              </div>

              {/* Details & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-[#121b2e]">
                      {issue.title}
                    </h3>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        issue.status === 'New'
                          ? 'bg-blue-100 text-blue-800'
                          : issue.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {issue.status === 'New' && (
                        <span className="material-symbols-outlined text-xs filled">fiber_new</span>
                      )}
                      {issue.status}
                    </span>
                  </div>

                  <p className="text-sm text-[#434655] leading-relaxed mb-3">
                    {issue.description}
                  </p>

                  {issue.managementNotes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 mb-3">
                      <span className="font-bold text-slate-900">Kitchen / Rector Note: </span>
                      {issue.managementNotes}
                    </div>
                  )}
                </div>

                {/* Submitter & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#737686]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span>
                      Submitted by {issue.studentName} (Rm {issue.roomNumber})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {issue.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIssue(issue);
                        setRemarks(issue.managementNotes || '');
                      }}
                      className="px-3 py-1.5 bg-[#f1f3ff] hover:bg-[#e1e8ff] text-[#004ac6] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      Update & Respond
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900">
              Handle Mess Complaint: {selectedIssue.title}
            </h4>

            <p className="text-xs text-slate-600">
              Reported by {selectedIssue.studentName} (Room {selectedIssue.roomNumber})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kitchen Inspection Notes / Direct Response:
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                placeholder="e.g. Spoke with head cook, instructed supervisor to use standardized portion ladles..."
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('In Progress')}
                className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
              >
                Mark In Progress
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('Resolved')}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
