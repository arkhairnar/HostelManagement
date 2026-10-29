import React from 'react';
import { Petition } from '../../types';
import { useHostel } from '../../context/HostelContext';

interface PetitionDetailsModalProps {
  petition: Petition;
  onClose: () => void;
}

export const PetitionDetailsModal: React.FC<PetitionDetailsModalProps> = ({ petition, onClose }) => {
  const { currentStudent, toggleSupportPetition, students } = useHostel();

  const isSupporting = petition.supportedByStudentIds.includes(currentStudent.id);
  const supporters = students.filter((s) => petition.supportedByStudentIds.includes(s.id));
  const remainingCount = Math.max(0, petition.supportersCount - supporters.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="text-base font-bold text-[#004ac6] uppercase tracking-wide">
              Request Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content matching Stitch Screen */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-white rounded-xl border border-[#c3c6d7] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d9e2fc] text-[#121b2e] text-xs font-semibold">
                <span className="material-symbols-outlined text-xs">public</span>
                Public Request • {petition.category}
              </span>
              <span className="text-xs text-[#434655]">Created {petition.createdAt}</span>
            </div>

            <h3 className="text-2xl font-bold text-[#121b2e] tracking-tight">
              {petition.title}
            </h3>

            <div className="text-sm text-[#434655] leading-relaxed whitespace-pre-line space-y-3">
              <p>{petition.description}</p>
            </div>

            {/* Threshold & Status badge */}
            <div className="pt-2">
              {petition.supportersCount >= petition.threshold ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-900 font-medium">
                  <span className="material-symbols-outlined text-blue-600 text-base filled">verified</span>
                  <span>
                    Threshold reached ({petition.supportersCount}/{petition.threshold} supporters). This request is currently active on the Head Rector's desk.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <span className="material-symbols-outlined text-amber-600 text-base">info</span>
                  <span>
                    Needs {petition.threshold - petition.supportersCount} more supporter(s) to reach management threshold (5 total required).
                  </span>
                </div>
              )}

              {petition.managementNotes && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
                  <span className="font-bold text-slate-900 block mb-0.5">Rector Note / Status:</span>
                  {petition.managementNotes}
                </div>
              )}
            </div>

            {/* Supporters Pile */}
            <div className="pt-4 border-t border-[#c3c6d7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {supporters.slice(0, 4).map((s) => (
                    <span key={s.id} title={s.name} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 flex items-center justify-center"><span className="material-symbols-outlined text-sm">person</span></span>
                  ))}
                  {(remainingCount > 0 || supporters.length > 4) && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#e1e8ff] text-[#121b2e] flex items-center justify-center text-xs font-bold">
                      +{remainingCount + Math.max(0, supporters.length - 4)}
                    </div>
                  )}
                </div>
                <div className="text-sm text-[#121b2e]">
                  <span className="font-bold">{petition.supportersCount} students</span> support this
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Initiated by {petition.createdByName} (Rm {petition.createdByRoom})
              </span>
            </div>
          </div>

          {/* Voting Action Area matching Stitch */}
          <div className="bg-[#f1f3ff] rounded-xl p-6 text-center space-y-3 border border-[#c3c6d7] border-dashed">
            <h4 className="text-base font-bold text-[#121b2e]">
              Do you support this request?
            </h4>
            <p className="text-xs text-[#434655]">
              Your vote directly counts toward the 5-student threshold required to escalate to hostel management.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => toggleSupportPetition(petition.id)}
                className={`py-3 px-8 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  isSupporting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-[#2563eb] hover:bg-[#004ac6] text-white shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isSupporting ? 'check' : 'thumb_up'}
                </span>
                {isSupporting ? 'Supported (Click to Withdraw)' : 'YES, I Support'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-8 rounded-lg font-semibold text-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
