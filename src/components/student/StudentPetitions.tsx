import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { Petition } from '../../types';
import { PetitionDetailsModal } from './PetitionDetailsModal';

export const StudentPetitions: React.FC = () => {
  const { petitions, currentStudent, toggleSupportPetition, createPetition } = useHostel();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reached' | 'gathering' | 'mine'>('all');
  const [selectedModalPetition, setSelectedModalPetition] = useState<Petition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Petition['category']>('Infrastructure');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createPetition({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const filteredPetitions = petitions.filter((p) => {
    if (activeFilter === 'reached') return p.supportersCount >= p.threshold;
    if (activeFilter === 'gathering') return p.supportersCount < p.threshold;
    if (activeFilter === 'mine') return p.createdByStudentId === currentStudent.id;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Student Requests
          </h2>
          <p className="text-sm md:text-base text-[#434655] mt-1">
            Initiate requests or support fellow students. <strong>At least 5 students</strong> must support a request before it escalates to hostel management.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create New Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-[#2563eb] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Requests ({petitions.length})
        </button>
        <button
          onClick={() => setActiveFilter('reached')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === 'reached'
              ? 'bg-[#2563eb] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Active on Management Desk (5+ votes) ({petitions.filter((p) => p.supportersCount >= p.threshold).length})
        </button>
        <button
          onClick={() => setActiveFilter('gathering')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === 'gathering'
              ? 'bg-[#2563eb] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Gathering Support (&lt; 5 votes) ({petitions.filter((p) => p.supportersCount < p.threshold).length})
        </button>
        <button
          onClick={() => setActiveFilter('mine')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === 'mine'
              ? 'bg-[#2563eb] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          My Requests ({petitions.filter((p) => p.createdByStudentId === currentStudent.id).length})
        </button>
      </div>

      {/* Petitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredPetitions.map((pet) => {
          const isSupporting = pet.supportedByStudentIds.includes(currentStudent.id);
          const hasReachedThreshold = pet.supportersCount >= pet.threshold;

          return (
            <div
              key={pet.id}
              className="bg-white border border-[#c3c6d7] rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div>
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#e9edff] text-[#004ac6] text-xs font-semibold">
                      {pet.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {pet.createdAt}
                    </span>
                  </div>

                  {hasReachedThreshold ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs filled">verified</span>
                      Reached Management
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      Needs {pet.threshold - pet.supportersCount} more
                    </span>
                  )}
                </div>

                {/* Title & Desc */}
                <h3
                  onClick={() => setSelectedModalPetition(pet)}
                  className="text-lg font-bold text-[#121b2e] hover:text-[#2563eb] transition-colors cursor-pointer mb-2 line-clamp-1"
                >
                  {pet.title}
                </h3>
                <p className="text-sm text-[#434655] line-clamp-3 mb-4">
                  {pet.description}
                </p>

                {/* Supporters Bar */}
                <div className="space-y-1 bg-[#f9f9ff] p-3 rounded-lg border border-slate-100 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {pet.supportersCount} Supporters
                    </span>
                    <span className="text-slate-500 font-medium">
                      Escalation Threshold: 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hasReachedThreshold ? 'bg-[#2563eb]' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (pet.supportersCount / Math.max(5, pet.supportersCount)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {pet.managementNotes && (
                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200/60 text-xs text-slate-800">
                    <span className="font-bold text-blue-900">Rector Status: </span>
                    {pet.managementNotes}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModalPetition(pet)}
                  className="text-xs font-semibold text-[#004ac6] hover:underline flex items-center gap-1"
                >
                  View Details & Discussion
                </button>

                <button
                  type="button"
                  onClick={() => toggleSupportPetition(pet.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSupporting
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-[#2563eb] text-white hover:bg-[#004ac6] shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isSupporting ? 'check' : 'thumb_up'}
                  </span>
                  <span>{isSupporting ? 'Supported' : 'Support Request'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedModalPetition && (
        <PetitionDetailsModal
          petition={selectedModalPetition}
          onClose={() => setSelectedModalPetition(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Petition['category'])}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Mess">Mess Food</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Library">Library</option>
                  <option value="Security">Security</option>
                  <option value="General">General Hostel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Request Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Install water purifier on 2nd floor"
                  required
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Justification
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this request is important to hostel residents and how many students it benefits..."
                  rows={4}
                  required
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
                <span>
                  <strong>Threshold Rule:</strong> This request will be listed publicly for fellow students to vote. Once 5 students support it, it is automatically forwarded to the Head Rector's Active Requests inbox.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-[#004ac6]"
                >
                  Publish Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
