import React, { useRef, useState } from 'react';
import { useHostel } from '../../context/HostelContext';

export const StudentProfilePage: React.FC = () => {
  const { currentStudent } = useHostel();
  const [photo, setPhoto] = useState<string>('');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Please choose an image file.'); return; }
    if (file.size >= 50 * 1024) { setMessage('Image must be smaller than 50 KB.'); event.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { const value = String(reader.result || ''); setPhoto(value); setMessage('Image preview added. Supabase Storage upload will be connected in the next integration step.'); };
    reader.readAsDataURL(file);
  };
  const fields = [
    ['Full name', currentStudent.name], ['Roll number', currentStudent.rollNumber], ['Email', currentStudent.email],
    ['Phone number', currentStudent.phone], ['Gender', currentStudent.gender || 'Not specified'], ['Academic year', currentStudent.year],
    ['Course', currentStudent.course], ['Room number', currentStudent.roomNumber], ['Bed', currentStudent.bed],
    ['Parent / Guardian', currentStudent.parentName], ['Parent phone', currentStudent.parentPhone],
  ];
  return <section className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wider text-red-600">Student portal</p><h1 className="mt-1 text-2xl font-bold text-slate-900">My Profile</h1><p className="mt-1 text-sm text-slate-500">Review your student details and optionally add a profile image.</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
      {photo ? <img src={photo} alt="Student profile" className="h-24 w-24 rounded-full object-cover border border-slate-200"/> : <div className="h-24 w-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><span className="material-symbols-outlined text-5xl">person</span></div>}
      <div className="flex-1"><h2 className="text-lg font-semibold text-slate-900">{currentStudent.name || 'Student'}</h2><p className="text-sm text-slate-500">Roll No. {currentStudent.rollNumber}</p><button onClick={() => inputRef.current?.click()} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">{photo ? 'Change profile image' : 'Add profile image'}</button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={choosePhoto}/><p className="mt-2 text-xs text-slate-500">Image must be smaller than 50 KB. The image is a temporary preview until Supabase Storage is connected.</p>{message && <p role="status" className="mt-1 text-sm text-red-600">{message}</p>}</div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([label,value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-900">{value || '—'}</p></div>)}</div>
  </section>;
};
