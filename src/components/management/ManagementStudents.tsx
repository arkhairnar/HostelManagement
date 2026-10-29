import React, { useMemo, useState } from 'react';
import { Plus, Search, Users, X, UserRound, Phone, GraduationCap, Mail, DoorOpen, Building2 } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';

interface StudentForm {
  name: string;
  email: string;
  phone: string;
  year: string;
  department: string;
  roomNumber: string;
}

const EMPTY_FORM: StudentForm = {
  name: '',
  email: '',
  phone: '',
  year: '',
  department: '',
  roomNumber: '',
};

export const ManagementStudents: React.FC = () => {
  const { students, addStudent } = useHostel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; studentId: string; temporaryPassword: string } | null>(null);

  const sortedStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...students]
      .filter((student) => !query || [student.rollNumber, student.name, student.email, student.phone, student.course, student.year, student.roomNumber].some((value) => (value ?? '').toLowerCase().includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [students, search]);

  const submitStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setCreatedCredentials(null);
    setSubmitting(true);
    try {
      const result = await addStudent({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        year: form.year,
        department: form.department.trim(),
        roomNumber: form.roomNumber.trim(),
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      setSuccess(result.message);
      setCreatedCredentials(result.credentials ?? null);
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
    } catch {
      setError('Student creation failed unexpectedly. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600 mb-2">Student directory</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">List of Students</h1>
          <p className="text-sm text-slate-500 mt-2">Register students, generate their login credentials, and manage hostel records.</p>
        </div>
        <button onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors">
          <Plus size={18} /> Add New Student
        </button>
      </div>

      {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Users size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">Student records</h2><p className="text-xs text-slate-500">{students.length} total students</p></div>
          </div>
          <label className="relative block w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, department, room..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Student ID</th>
                <th className="px-5 py-4 font-semibold">Student</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Academic Year</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Room Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-red-50/40 transition-colors">
                  <td className="px-5 py-4"><span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">{student.rollNumber || '—'}</span></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><UserRound size={17} /></span><div><p className="text-sm font-semibold text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></div></div></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{student.phone || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{student.year || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{student.course || '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{student.roomNumber || '—'}</td>
                </tr>
              ))}
              {sortedStudents.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Users size={22} /></div><p className="font-semibold text-slate-700">No students found</p><p className="mt-1 text-sm text-slate-500">Try another search or add a student record.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm overflow-y-auto" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setIsModalOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-student-title" className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">
              <div><div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><UserRound size={20} /></div><h2 id="add-student-title" className="text-xl font-bold text-slate-900">Register a new student</h2><p className="mt-1 text-sm text-slate-500">Enter the student's details. A unique Student ID and temporary password will be generated and displayed here after creation. No email will be sent.</p></div>
              <button type="button" onClick={() => !submitting && setIsModalOpen(false)} aria-label="Close form" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" disabled={submitting}><X size={19} /></button>
            </div>
            <form onSubmit={submitStudent} className="space-y-4 p-5 md:p-6">
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Student full name (first name and surname) *</span><input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Anuj Singh" autoComplete="name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Phone size={13} /> Phone number *</span><input required type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Student phone number" autoComplete="tel" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Mail size={13} /> Email address *</span><input required type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" autoComplete="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><GraduationCap size={14} /> Academic year *</span><select required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"><option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option><option>Postgraduate</option><option>Research Scholar</option></select></label>
                <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Building2 size={14} /> Department *</span><input required maxLength={100} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Engineering" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block sm:col-span-2"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><DoorOpen size={14} /> Room number *</span><input required maxLength={30} value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. B-204" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">The system generates a unique Student ID and a secure temporary password. After creation, the credentials appear on screen for you to share manually. No email is sent.</div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{submitting ? 'Generating credentials…' : 'Create Student & Show Credentials'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdCredentials && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="credentials-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">✓</div>
              <h2 id="credentials-title" className="text-2xl font-bold text-slate-900">Student Created Successfully</h2>
              <p className="mt-2 text-sm text-slate-500">Share these credentials with the student now. This temporary password will not be shown again after closing this window.</p>
            </div>
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student name</p><p className="mt-1 font-semibold text-slate-900">{createdCredentials.name}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Login email</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all text-sm text-slate-800">{createdCredentials.email}</code><button type="button" onClick={() => void navigator.clipboard.writeText(createdCredentials.email)} className="shrink-0 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold">Copy</button></div></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student ID</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all font-bold text-red-700">{createdCredentials.studentId}</code><button type="button" onClick={() => void navigator.clipboard.writeText(createdCredentials.studentId)} className="shrink-0 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold">Copy</button></div></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Temporary password</p><div className="mt-1 flex items-center justify-between gap-2"><code className="break-all font-bold text-slate-900">{createdCredentials.temporaryPassword}</code><button type="button" onClick={() => void navigator.clipboard.writeText(createdCredentials.temporaryPassword)} className="shrink-0 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold">Copy</button></div></div>
            </div>
            <button type="button" onClick={() => void navigator.clipboard.writeText(`Academic Living System\\nName: ${createdCredentials.name}\\nLogin email: ${createdCredentials.email}\\nStudent ID: ${createdCredentials.studentId}\\nTemporary password: ${createdCredentials.temporaryPassword}`)} className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700">Copy All Credentials</button>
            <button type="button" onClick={() => setCreatedCredentials(null)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Done — I have shared the credentials</button>
            <p className="mt-3 text-xs leading-relaxed text-amber-700">Security reminder: give these credentials directly to the student and ask them to change the temporary password as soon as possible.</p>
          </div>
        </div>
      )}
    </div>
  );
};
