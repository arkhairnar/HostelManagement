import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';



export const StudentMess: React.FC = () => {
  const { currentStudent, submitMessComplaint, messComplaints } = useHostel();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const resolvedTitle = title.trim() || 'Mess Food Quality Query';
    submitMessComplaint({
      title: resolvedTitle,
      description,
      photoUrl,
    });

    setTitle('');
    setDescription('');
    setPhotoUrl(undefined);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  // Student's complaints
  const myComplaints = messComplaints.filter((c) => c.studentId === currentStudent.id);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
          Report a Mess Problem
        </h2>
        <p className="text-sm md:text-base text-[#434655] mt-1">
          Provide details and an optional photo to help management resolve the issue quickly.
        </p>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 filled">check_circle</span>
          <div>
            <p className="font-semibold">Mess Complaint Submitted!</p>
            <p className="text-xs text-emerald-700">Rector and mess supervisor have been notified.</p>
          </div>
        </div>
      )}

      {/* Form Card matching Stitch design */}
      <div className="bg-white rounded-xl border border-[#c3c6d7] p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title / Summary */}
          <div>
            <label className="block text-sm font-semibold text-[#121b2e] mb-2" htmlFor="problem-title">
              Issue Headline
            </label>
            <input
              id="problem-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Insect found in dal, Insufficient portions, Undercooked rice..."
              className="w-full rounded-lg border border-[#c3c6d7] bg-[#f9f9ff] px-4 py-2.5 text-sm text-[#121b2e] placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
              required
            />
          </div>

          {/* Photo Evidence Area */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#121b2e]">
              Photo Evidence (Optional)
            </label>
            
            {photoUrl ? (
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-300 group">
                <img src={photoUrl} alt="Uploaded evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <label className="w-full h-44 rounded-xl border-2 border-dashed border-[#c3c6d7] bg-[#f9f9ff] hover:bg-[#f1f3ff] hover:border-[#2563eb] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                <div className="w-14 h-14 rounded-full bg-[#e9edff] flex items-center justify-center group-hover:bg-[#2563eb] transition-colors">
                  <span className="material-symbols-outlined text-[#434655] group-hover:text-white transition-colors text-2xl">
                    add_a_photo
                  </span>
                </div>
                <span className="text-sm text-[#434655] font-medium group-hover:text-[#2563eb]">
                  Click or drag to upload a photograph
                </span>
                <span className="text-xs text-[#737686]">JPG, PNG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}


          </div>

          {/* Description Area */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#121b2e]" htmlFor="problem-description">
              Problem Description
            </label>
            <textarea
              id="problem-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue you encountered in the mess (e.g., meal time, food hygiene, portion sizes, burnt food)..."
              rows={4}
              required
              className="w-full rounded-lg border border-[#c3c6d7] bg-[#f9f9ff] p-4 text-sm text-[#121b2e] placeholder:text-[#737686] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all resize-y"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-[#2563eb] text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-[#004ac6] hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Submit Report
            </button>
          </div>
        </form>
      </div>

      {/* Previously Submitted Issues by This Student */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#121b2e]">
          My Submitted Complaints ({myComplaints.length})
        </h3>

        {myComplaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            You have not submitted any mess complaints yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myComplaints.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#c3c6d7] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4"
              >
                {item.photoUrl && (
                  <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        item.status === 'New'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#434655] line-clamp-2">{item.description}</p>
                    
                    {item.managementNotes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <span className="font-semibold text-blue-700">Rector Response: </span>
                        {item.managementNotes}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {item.timestamp}
                    </span>
                    <span>•</span>
                    <span>Room {item.roomNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
