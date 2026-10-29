import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';

export const StudentAttendance: React.FC = () => {
  const { currentStudent, recordAttendance, attendanceHistory } = useHostel();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleCapture = () => {
    setIsVerifying(true);
    setPhotoPreview(currentStudent.avatar);

    setTimeout(() => {
      setIsVerifying(false);
      setIsVerifiedSuccess(true);
      recordAttendance(currentStudent.avatar);

      setTimeout(() => {
        setIsVerifiedSuccess(false);
      }, 3500);
    }, 1800);
  };

  const studentRecords = attendanceHistory.filter((r) => r.studentId === currentStudent.id);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
          Attendance
        </h2>
        <p className="text-sm md:text-base text-[#434655] mt-1">
          Daily attendance check-in record and live biometric verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Verification Card matching Stitch Mockup */}
        <div className="lg:col-span-6 bg-white border border-[#c3c6d7] rounded-xl p-6 md:p-8 shadow-sm flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="text-center w-full">
            <h3 className="text-xl font-bold text-[#121b2e] mb-1">
              Live Check-In
            </h3>
            <p className="text-xs text-[#434655]">
              Live selfie required. Existing photos/files cannot be uploaded for attendance.
            </p>
          </div>

          {/* Camera Viewfinder Area */}
          <div className="w-full aspect-[4/3] max-w-sm bg-[#e9edff] rounded-xl border-2 border-dashed border-[#737686] flex items-center justify-center relative overflow-hidden group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[#737686] text-6xl group-hover:scale-110 transition-transform duration-300">
                  photo_camera
                </span>
                <span className="text-xs text-slate-500 font-medium">Front Camera Stream Ready</span>
              </div>
            )}

            {/* Scanning line animation */}
            {isVerifying && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2563eb]/25 to-transparent animate-scan" />
            )}

            {/* Processing Overlay */}
            {isVerifying && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <span className="material-symbols-outlined text-[#2563eb] text-4xl animate-spin mb-2">
                  progress_activity
                </span>
                <p className="text-sm font-bold text-[#2563eb]">Verifying attendance...</p>
                <p className="text-xs text-slate-500">Checking face liveness & hostel geotag</p>
              </div>
            )}

            {/* Success Overlay */}
            {isVerifiedSuccess && (
              <div className="absolute inset-0 bg-emerald-50/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-lg">
                  <span className="material-symbols-outlined text-3xl font-bold">check</span>
                </div>
                <p className="text-base font-bold text-emerald-800">Attendance verified</p>
                <p className="text-xs text-emerald-600 font-medium">
                  Recorded at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={isVerifying}
            className={`w-full py-3.5 px-6 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              currentStudent.todayAttendance === 'Present'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#2563eb] hover:bg-[#004ac6] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-lg">photo_camera</span>
            <span>
              {currentStudent.todayAttendance === 'Present' ? 'Re-verify Today\'s Attendance' : 'Capture & Verify Attendance'}
            </span>
          </button>
        </div>

        {/* Right Column: Attendance Statistics & Pre-existing Data */}
        <div className="lg:col-span-6 space-y-6">
          {/* Monthly Stats Bento Card */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#121b2e] mb-4">
              Monthly Attendance Overview
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="bg-[#f9f9ff] p-3 rounded-lg border border-slate-200">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {currentStudent.attendanceRate}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 font-medium">
                  Compliance Rate
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <span className="text-2xl font-bold text-emerald-700 tabular-nums">26</span>
                <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
                  Days Present
                </span>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <span className="text-2xl font-bold text-red-700 tabular-nums">1</span>
                <span className="text-[11px] text-red-700 block mt-1 font-medium">
                  Days Absent
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Required Semester Threshold: 75%</span>
                <span className="text-emerald-700">In Good Standing</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${currentStudent.attendanceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pre-existing Attendance Logs Table */}
          <div className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#121b2e] mb-3">
              Recent Attendance Log
            </h3>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {studentRecords.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rec.status === 'Present'
                          ? 'bg-emerald-500'
                          : rec.status === 'Leave'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium text-slate-800">{rec.date}</span>
                    {rec.time && <span className="text-slate-400">({rec.time})</span>}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      rec.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'Leave'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
