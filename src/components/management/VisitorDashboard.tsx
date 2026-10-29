import React from 'react';
import { Building2, ClipboardList, Clock3, ShieldCheck } from 'lucide-react';

export const VisitorDashboard: React.FC = () => (
  <div className="mx-auto max-w-5xl py-4">
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-rose-500 p-7 text-white shadow-lg md:p-10">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold"><ShieldCheck size={15} /> Visitor access</div>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Welcome to Academic Living System</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50 md:text-base">A central place for hostel information and student services. Visitor mode is read-only; choose Student or Rector / Management in the top bar to enter the relevant portal.</p>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Building2 className="mb-4 text-red-600" size={23} /><h2 className="font-semibold text-slate-900">Hostel overview</h2><p className="mt-2 text-sm leading-5 text-slate-500">Hostel operations and room management are organized in one portal.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardList className="mb-4 text-red-600" size={23} /><h2 className="font-semibold text-slate-900">Student services</h2><p className="mt-2 text-sm leading-5 text-slate-500">Students can use the portal for requests, complaints, leave, and attendance.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Clock3 className="mb-4 text-red-600" size={23} /><h2 className="font-semibold text-slate-900">Live operations</h2><p className="mt-2 text-sm leading-5 text-slate-500">Shared updates are available when the Supabase cloud database is configured.</p></div>
    </div>
  </div>
);
