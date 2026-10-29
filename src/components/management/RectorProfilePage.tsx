import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, KeyRound, LoaderCircle, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const RectorProfilePage: React.FC = () => {
  const { managementProfile, updateManagementProfile } = useHostel();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(managementProfile.name);
  const [email, setEmail] = useState(managementProfile.email);
  const [phone, setPhone] = useState(managementProfile.phone);
  const [hostelName, setHostelName] = useState(managementProfile.hostelName);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(managementProfile.avatar);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);

  useEffect(() => {
    setFullName(managementProfile.name);
    setEmail(managementProfile.email);
    setPhone(managementProfile.phone);
    setHostelName(managementProfile.hostelName);
    setPhotoPreview(managementProfile.avatar);
  }, [managementProfile]);

  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessageError(true); setMessage('Choose a JPG, PNG, or WebP image.'); event.target.value = ''; return;
    }
    if (file.size > 50 * 1024) {
      setMessageError(true); setMessage('The profile image must be 50 KB or smaller.'); event.target.value = ''; return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!supabase || !isSupabaseConfigured) { setMessageError(true); setMessage('Supabase is not configured.'); return; }
    if (!managementProfile.id) { setMessageError(true); setMessage('Could not identify the signed-in Rector. Sign in again and retry.'); return; }
    if (!fullName.trim() || !email.trim()) { setMessageError(true); setMessage('Full name and email address are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessageError(true); setMessage('Enter a valid email address.'); return; }
    if (newPassword && (newPassword.length < 12 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword))) { setMessageError(true); setMessage('Use at least 12 characters with letters, numbers, and a symbol.'); return; }
    if (newPassword && newPassword !== confirmPassword) { setMessageError(true); setMessage('The new passwords do not match.'); return; }

    setBusy(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user || authData.user.id !== managementProfile.id) throw new Error('Your session could not be verified. Sign in again.');
      let avatarPath = managementProfile.avatarPath;
      if (photoFile) {
        const extension = photoFile.type === 'image/png' ? 'png' : photoFile.type === 'image/webp' ? 'webp' : 'jpg';
        avatarPath = `${authData.user.id}/rector-avatar.${extension}`;
        const { error: uploadError } = await supabase.storage.from('hostel-profiles').upload(avatarPath, photoFile, { upsert: true, contentType: photoFile.type });
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}. Check the hostel-profiles Storage bucket and policies.`);
      }
      const updates = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        hostel_name: hostelName.trim() || null,
        avatar_path: avatarPath || null,
        updated_at: new Date().toISOString(),
      };
      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', authData.user.id);
      if (updateError) throw new Error(`Could not save profile: ${updateError.message}. Apply the profile columns in supabase/schema.sql if needed.`);

      let avatar = photoPreview;
      if (avatarPath) {
        const { data: signed } = await supabase.storage.from('hostel-profiles').createSignedUrl(avatarPath, 3600);
        avatar = signed?.signedUrl ?? photoPreview;
      }
      updateManagementProfile({ name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), hostelName: hostelName.trim(), avatar, avatarPath });

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw new Error(`Profile saved, but password could not be changed: ${passwordError.message}`);
        setNewPassword(''); setConfirmPassword('');
      }
      setPhotoFile(null);
      setMessageError(false);
      setMessage('Rector profile saved successfully.');
    } catch (error) {
      setMessageError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to save your profile. Please try again.');
    } finally { setBusy(false); }
  };

  const initials = fullName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'R';

  return <section className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Rector workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">My Profile</h1><p className="mt-1 text-sm text-slate-500">Manage your contact details and profile photograph.</p></div>

    <form onSubmit={saveProfile} className="space-y-6">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0">
          {photoPreview ? <img src={photoPreview} alt="Rector profile" className="h-24 w-24 rounded-full border border-slate-200 object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-2xl font-bold text-blue-800">{initials}</div>}
          <button type="button" onClick={() => inputRef.current?.click()} aria-label="Choose profile photograph" className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white hover:bg-blue-800"><Camera size={17} /></button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={choosePhoto} />
        </div>
        <div className="min-w-0 flex-1"><h2 className="text-lg font-bold text-slate-900">{fullName || 'Rector'}</h2><p className="mt-1 text-sm text-slate-500">Hostel Administrator</p><p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP · maximum 50 KB. Your photo is stored in your private profile folder.</p></div>
        <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck size={15} /> Rector account</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Personal details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name *</span><input required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Username</span><input value={managementProfile.username} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500" /><span className="mt-1 block text-xs text-slate-500">Your username is used to sign in and cannot be changed here.</span></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address *</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><span className="mt-1 block text-xs text-slate-500">Contact email saved to your Rector profile.</span></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number</span><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Hostel name</span><input value={hostelName} onChange={(e) => setHostelName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Hostel managed" /></label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><KeyRound size={19} className="text-blue-700" /><h2 className="text-lg font-bold text-slate-900">Change password</h2></div>
        <p className="mb-4 text-sm text-slate-500">Leave these fields empty if you do not want to change your password.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">New password</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={12} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="At least 12 characters" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm new password</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={12} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Re-enter new password" /></label>
        </div>
      </div>

      {message && <div role="status" className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${messageError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{!messageError && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}{message}</div>}
      <div className="flex justify-end"><button disabled={busy} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><LoaderCircle size={17} className="animate-spin" /> Saving...</> : <><Save size={17} /> Save profile</>}</button></div>
    </form>
    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><UserRound size={18} className="mt-0.5 shrink-0" /><p>Only your own profile is loaded. Department and office location are not included.</p></div>
  </section>;
};
