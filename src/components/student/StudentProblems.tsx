import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { RoomProblem } from '../../types';

const CATEGORIES: { label: string; icon: string; value: RoomProblem['category'] }[] = [
  { label: 'Fan not working', icon: 'mode_fan', value: 'Fan' },
  { label: 'Light not working', icon: 'lightbulb', value: 'Light' },
  { label: 'Room not clean', icon: 'cleaning_services', value: 'Cleanliness' },
  { label: 'Water / Plumbing', icon: 'water_drop', value: 'Water' },
  { label: 'Furniture damage', icon: 'chair', value: 'Furniture' },
  { label: 'Electrical problem', icon: 'electrical_services', value: 'Electrical' },
  { label: 'Other', icon: 'build', value: 'Other' },
];

export const StudentProblems: React.FC = () => {
  const { currentStudent, reportRoomProblem, roomProblems } = useHostel();

  const [category, setCategory] = useState<RoomProblem['category']>('Fan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSelectQuickCategory = (cat: RoomProblem['category'], defaultTitle: string) => {
    setCategory(cat);
    if (!title) {
      setTitle(defaultTitle);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    reportRoomProblem({
      category,
      title: title.trim(),
      description: description.trim(),
    });

    setTitle('');
    setDescription('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  // Filter problems for current student's room
  const myRoomProblems = roomProblems.filter((p) => p.roomNumber === currentStudent.roomNumber);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
          Room Problems & Maintenance
        </h2>
        <p className="text-sm md:text-base text-[#434655] mt-1">
          Report room defects and fixtures. Reports are automatically assigned to <strong>Room {currentStudent.roomNumber}</strong>.
        </p>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 filled">check_circle</span>
          <div>
            <p className="font-semibold">Room Problem Reported!</p>
            <p className="text-xs text-emerald-700">
              Logged under Room {currentStudent.roomNumber}. Management and maintenance staff have received the notification.
            </p>
          </div>
        </div>
      )}

      {/* Auto Room Association Banner */}
      <div className="bg-[#f1f3ff] border border-[#c3c6d7] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold">
            {currentStudent.roomNumber}
          </div>
          <div>
            <span className="text-xs font-semibold text-[#004ac6] uppercase tracking-wider block">
              Auto Room Mapping
            </span>
            <p className="text-sm font-semibold text-slate-800">
              Student: {currentStudent.name} • Room: {currentStudent.roomNumber} ({currentStudent.bed})
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Hostel Block A, 2nd Floor
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#121b2e] mb-4">
          Report an Issue
        </h3>

        {/* Quick presets */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Quick Select Common Problem:
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleSelectQuickCategory(cat.value, cat.label)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  category === cat.value
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'bg-[#f1f3ff] text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prob-title">
              Problem Title
            </label>
            <input
              id="prob-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fan not working, Light flickers, Bathroom tap leak..."
              required
              className="w-full text-sm px-4 py-2.5 border border-[#c3c6d7] rounded-lg bg-[#f9f9ff] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="prob-desc">
              Detailed Description & Location in Room
            </label>
            <textarea
              id="prob-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly (e.g. The ceiling fan is making a loud grinding noise and completely stops spinning after 5 minutes)..."
              rows={4}
              required
              className="w-full text-sm px-4 py-2.5 border border-[#c3c6d7] rounded-lg bg-[#f9f9ff] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none resize-y"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">report</span>
              Submit Problem to Room {currentStudent.roomNumber}
            </button>
          </div>
        </form>
      </div>

      {/* Room Problem History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#121b2e]">
            Room {currentStudent.roomNumber} Maintenance Issues ({myRoomProblems.length})
          </h3>
          <span className="text-xs text-slate-500">
            Visible to all room roommates and Rector
          </span>
        </div>

        {myRoomProblems.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 block">task_alt</span>
            No open problems reported for Room {currentStudent.roomNumber}. Everything is in good order!
          </div>
        ) : (
          <div className="space-y-3">
            {myRoomProblems.map((prob) => (
              <div
                key={prob.id}
                className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e9edff] text-[#004ac6] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">
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
                      <h4 className="font-bold text-slate-900 text-base">{prob.title}</h4>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          prob.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : prob.status === 'Assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prob.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#434655] leading-relaxed max-w-xl">
                      {prob.description}
                    </p>

                    {prob.assignedStaff && (
                      <p className="text-xs text-blue-700 font-medium mt-2">
                        Assigned Staff: {prob.assignedStaff}
                      </p>
                    )}

                    {prob.rectorRemarks && (
                      <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Rector Remarks: </span>
                        {prob.rectorRemarks}
                      </div>
                    )}

                    <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Reported by {prob.studentName}</span>
                      <span>•</span>
                      <span>{prob.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                    Room {prob.roomNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
