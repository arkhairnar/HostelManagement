import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { Petition } from '../../types';

export const ManagementPetitions: React.FC = () => {
  const { petitions, managePetition } = useHostel();

  const [activeModalAction, setActiveModalAction] = useState<{
    petition: Petition;
    action: 'accepted' | 'delayed' | 'denied';
  } | null>(null);
  const [rectorNotes, setRectorNotes] = useState('');

  // Critical rule: ONLY petitions that reached the 5-student threshold appear here!
  const thresholdPetitions = petitions.filter(
    (p) => p.supportersCount >= p.threshold
  );

  const handleConfirmDecision = () => {
    if (!activeModalAction) return;
    managePetition(
      activeModalAction.petition.id,
      activeModalAction.action,
      rectorNotes.trim() || undefined
    );
    setActiveModalAction(null);
    setRectorNotes('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Active Requests
          </h2>
          <p className="text-sm md:text-base text-[#434655] mt-1">
            Student requests that have crossed the <strong>5-student support threshold</strong> and require management action.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 font-bold rounded-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm filled">verified</span>
            5+ Supporters Threshold Met ({thresholdPetitions.length})
          </span>
        </div>
      </div>

      {/* Bento Grid Layout matching Stitch screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Requests List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {thresholdPetitions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2 block">assignment_turned_in</span>
              No active student requests have reached the 5-student threshold yet.
            </div>
          ) : (
            thresholdPetitions.map((pet) => {
              const isAccepted = pet.status === 'accepted';
              const isDenied = pet.status === 'denied';
              const isDelayed = pet.status === 'delayed';

              return (
                <div
                  key={pet.id}
                  className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-[#e9edff] text-[#004ac6] rounded-md text-xs font-semibold">
                          {pet.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-[#434655] rounded-md text-xs font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {pet.createdAt}
                        </span>
                        <span className="text-xs text-slate-500">
                          Initiated by {pet.createdByName} (Rm {pet.createdByRoom})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#121b2e] mb-1.5">
                        {pet.title}
                      </h3>
                      <p className="text-sm text-[#434655] mb-4 leading-relaxed">
                        {pet.description}
                      </p>

                      {/* Support Bar matching Stitch */}
                      <div className="flex flex-col gap-1.5 bg-[#f9f9ff] p-3 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-900 tabular-nums">
                            {pet.supportersCount} Supporters
                          </span>
                          <span className="text-[#004ac6]">
                            Target: 100 • Threshold 5 Passed ✓
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (pet.supportersCount / 100) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {pet.managementNotes && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                          <span className="font-bold text-slate-900">Rector Decision: </span>
                          <span className="uppercase font-bold text-blue-700 mr-2">[{pet.status}]</span>
                          {pet.managementNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rector Actions matching brief: Accept, Delay, Deny */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
                    {isAccepted ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm filled">check_circle</span>
                        Accepted by Rector
                      </span>
                    ) : isDenied ? (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm filled">cancel</span>
                        Denied by Rector
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalAction({ petition: pet, action: 'denied' });
                            setRectorNotes('Cannot approve at this stage due to hostel policy constraints.');
                          }}
                          className="px-4 py-2 text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Deny
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalAction({ petition: pet, action: 'delayed' });
                            setRectorNotes('Under administrative review and vendor quotation.');
                          }}
                          className="px-4 py-2 text-amber-800 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">hourglass_top</span>
                          Delay / Under Consideration
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalAction({ petition: pet, action: 'accepted' });
                            setRectorNotes('Approved. Forwarded to hostel warden and procurement committee for implementation.');
                          }}
                          className="px-4 py-2 bg-[#2563eb] text-white hover:bg-[#004ac6] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Accept Request
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats / Summary Column (4 cols) matching Stitch screen */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#121b2e] mb-4">
              Request Overview
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#004ac6]">
                    <span className="material-symbols-outlined text-lg">pending_actions</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Active Requests (5+ votes)
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {thresholdPetitions.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <span className="material-symbols-outlined text-lg">task_alt</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Resolved this Month
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 tabular-nums">8</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <span className="material-symbols-outlined text-lg">how_to_vote</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Total Student Votes
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {petitions.reduce((acc, curr) => acc + curr.supportersCount, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Concerns matching Stitch */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#121b2e] mb-3">
              Top Concerns
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#f1f3ff] text-slate-800 rounded-full text-xs font-semibold border border-slate-200">
                Infrastructure (5)
              </span>
              <span className="px-3 py-1.5 bg-[#f1f3ff] text-slate-800 rounded-full text-xs font-semibold border border-slate-200">
                Mess Food (4)
              </span>
              <span className="px-3 py-1.5 bg-[#f1f3ff] text-slate-800 rounded-full text-xs font-semibold border border-slate-200">
                Cleanliness (2)
              </span>
              <span className="px-3 py-1.5 bg-[#f1f3ff] text-slate-800 rounded-full text-xs font-semibold border border-slate-200">
                Security (1)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Confirm Rector Decision: {activeModalAction.action.toUpperCase()}
            </h4>
            <p className="text-xs text-slate-600">
              Request: &ldquo;{activeModalAction.petition.title}&rdquo; ({activeModalAction.petition.supportersCount} supporters)
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Remarks (Visible to student body):
              </label>
              <textarea
                value={rectorNotes}
                onChange={(e) => setRectorNotes(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                placeholder="Enter rector remarks..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalAction(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className="px-5 py-2 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6]"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
