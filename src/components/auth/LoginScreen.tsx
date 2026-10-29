import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type LoginRole = 'student' | 'management';

export const LoginScreen: React.FC = () => {
  const { students, loginAsStudent, loginAsManagement } = useHostel();
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [registeringRector, setRegisteringRector] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rectorCode, setRectorCode] = useState('');
  const [rectorFullName, setRectorFullName] = useState('');
  const [rectorEmail, setRectorEmail] = useState('');
  const [rectorPhone, setRectorPhone] = useState('');
  const [rectorHostelName, setRectorHostelName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [firstLoginStudentId, setFirstLoginStudentId] = useState<string | null>(null);
  const [firstLoginPassword, setFirstLoginPassword] = useState('');
  const [firstLoginPasswordConfirm, setFirstLoginPasswordConfirm] = useState('');
  const [firstLoginError, setFirstLoginError] = useState('');
  const [firstLoginBusy, setFirstLoginBusy] = useState(false);

  const resetForm = (role: LoginRole) => {
    setSelectedRole(role);
    setRegisteringRector(false);
    setIdentifier('');
    setPassword('');
    setRectorCode('');
    setRectorFullName('');
    setRectorEmail('');
    setRectorPhone('');
    setRectorHostelName('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!selectedRole) return;
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the development server.');
      return;
    }
    if (!identifier.trim() || !password || (selectedRole === 'management' && !rectorCode.trim()) || (selectedRole === 'management' && registeringRector && (!rectorFullName.trim() || !rectorEmail.trim()))) {
      setError(selectedRole === 'management' ? (registeringRector ? 'Enter your full name, email, username, password, and rector code.' : 'Enter your rector username, password, and rector code.') : 'Enter your registered student email and password.');
      return;
    }

    setBusy(true);
    try {
      const normalizedIdentifier = identifier.trim().toLowerCase();
      if (selectedRole === 'management') {
        const username = normalizedIdentifier.replace(/^@/, '');
        if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new Error('Use a rector username with 3–32 letters, numbers, dots, underscores, or hyphens.');
        const authEmail = `${username}@rector.als.invalid`;
        if (registeringRector) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rectorEmail.trim())) throw new Error('Enter a valid email address.');
          const { data: registration, error: registrationError } = await supabase.functions.invoke('register-rector', {
            body: { username: `@${username}`, fullName: rectorFullName.trim(), email: rectorEmail.trim().toLowerCase(), phone: rectorPhone.trim(), hostelName: rectorHostelName.trim(), password, code: rectorCode.trim() },
          });
          if (registrationError || registration?.success !== true) throw new Error(registration?.error || registrationError?.message || 'Rector registration failed. Check the code and server configuration.');
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password });
          if (signInError) throw new Error('Rector account was created. Sign in with your new username and password.');
          const { data: codeResult, error: codeError } = await supabase.functions.invoke('validate-rector-code', { body: { code: rectorCode.trim() } });
          if (codeError || codeResult?.valid !== true) { await supabase.auth.signOut(); throw new Error('Account created, but rector verification could not be completed. Check Edge Function configuration.'); }
          loginAsManagement();
          return;
        }
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: authEmail, password });
        if (authError || !data.user) throw new Error('Invalid rector username or password.');
        const { data: codeResult, error: codeError } = await supabase.functions.invoke('validate-rector-code', { body: { code: rectorCode.trim() } });
        if (codeError || codeResult?.valid !== true) { await supabase.auth.signOut(); throw new Error(codeResult?.error || codeError?.message || 'Invalid rector code or account is not authorized as a rector.'); }
        loginAsManagement();
        return;
      }
      // Student accounts use the email registered by the rector.
      
      const email = normalizedIdentifier.includes('@') ? identifier.trim() : '';
      if (!email) throw new Error('For student sign-in, enter the registered email address provided by your rector.');
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) throw new Error(authError?.message || 'Sign-in failed. Check your credentials.');
      const { data: profile, error: profileError } = await supabase
        .from('students')
        .select('id, auth_user_id')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();
      if (profileError || !profile) { await supabase.auth.signOut(); throw new Error('Your login is valid, but your student profile is not linked yet. Ask your rector to complete registration.'); }
      if (data.user.user_metadata?.must_change_password === true) {
        setFirstLoginStudentId(profile.id);
        setFirstLoginPassword('');
        setFirstLoginPasswordConfirm('');
        setFirstLoginError('');
        return;
      }
      loginAsStudent(profile.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f9f9ff] text-[#121b2e] selection:bg-red-600 selection:text-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-200">
        <img className="absolute inset-0 w-full h-full object-cover" alt="Modern collegiate hostel room" src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-red-950/45 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-10 h-full w-full">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/30 shadow-xl max-w-md">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md"><Building2 size={23} /></div><span className="font-bold text-xl text-slate-900 tracking-tight">KKWIEER</span></div>
            <p className="text-sm text-slate-600 leading-relaxed">A simpler, smarter way to manage hostel life, student services, and everyday campus operations.</p>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500"><span>Student & Rector Portal</span><span>•</span><span>Academic Year 2026</span></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col px-6 md:px-12 py-10 justify-center bg-white relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-3 mb-10"><div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md"><Building2 size={24} /></div><div><span className="font-bold text-lg text-slate-900 tracking-tight block">KKWIEER</span><span className="text-xs text-slate-500">Academic Living System · Hostel Management Portal</span></div></div>
          <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600 mb-2">Welcome</p><h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Sign in to continue</h1><p className="text-slate-500 text-sm mt-3 leading-relaxed">Choose your account type, then enter your credentials.</p></div>

          {!selectedRole ? (
            <div className="space-y-4">
              {import.meta.env.DEV && (
                <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Local demo preview">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><Eye size={21} /></span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-slate-900">Explore Demo — No Sign-in Required</h2>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">Preview the existing dashboards locally. This is a development-only preview, not a real authenticated session. Records remain empty until connected and configured.</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button type="button" onClick={() => loginAsManagement()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">Preview Rector Dashboard</button>
                        <button type="button" onClick={() => loginAsStudent()} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50">Preview Student Dashboard</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              <button type="button" onClick={() => resetForm('management')} className="w-full text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50 transition-all group focus:outline-none focus:ring-4 focus:ring-red-100"><span className="flex items-center gap-4"><span className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"><ShieldCheck size={25} /></span><span className="flex-1"><span className="block font-bold text-slate-900 text-base">Sign in as Rector</span><span className="block text-sm text-slate-600 mt-1">Registered account, password, and rector access code.</span></span><ArrowRight className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-transform" /></span></button>
              <button type="button" onClick={() => resetForm('student')} className="w-full text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50 transition-all group focus:outline-none focus:ring-4 focus:ring-red-100"><span className="flex items-center gap-4"><span className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"><GraduationCap size={26} /></span><span className="flex-1"><span className="block font-bold text-slate-900 text-base">Sign in as Student</span><span className="block text-sm text-slate-600 mt-1">Use the registered email and password provided during student account setup.</span></span><ArrowRight className="text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-transform" /></span></button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800">{selectedRole === 'student' ? <GraduationCap size={19} /> : <ShieldCheck size={19} />}{selectedRole === 'student' ? 'Student sign-in' : registeringRector ? 'Rector registration' : 'Rector sign-in'}</div><button type="button" onClick={() => { setSelectedRole(null); setIdentifier(''); setPassword(''); setRectorCode(''); setRectorFullName(''); setRectorEmail(''); setRectorPhone(''); setRectorHostelName(''); setError(''); }} className="text-xs font-semibold text-red-600 hover:text-red-700">Change role</button></div>
              {selectedRole === 'management' && registeringRector && <>
                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span><input autoComplete="name" required value={rectorFullName} onChange={(e) => setRectorFullName(e.target.value)} placeholder="Enter your full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span><input autoComplete="email" type="email" required value={rectorEmail} onChange={(e) => setRectorEmail(e.target.value)} placeholder="rector@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone number (optional)</span><input autoComplete="tel" type="tel" value={rectorPhone} onChange={(e) => setRectorPhone(e.target.value)} placeholder="Contact number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Hostel name (optional)</span><input value={rectorHostelName} onChange={(e) => setRectorHostelName(e.target.value)} placeholder="Hostel managed" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
              </>}
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{selectedRole === 'management' ? 'Rector username' : 'Registered student email'}</span><input autoComplete="username" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={selectedRole === 'student' ? 'student@example.com' : '@YourUsername'} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span><span className="relative block"><input autoComplete="current-password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={registeringRector ? 'Create a strong password (12+ characters)' : 'Enter your password'} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
              {selectedRole === 'management' && <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Rector verification code</span><input autoComplete="off" required type="password" value={rectorCode} onChange={(e) => setRectorCode(e.target.value)} placeholder="Enter rector code" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /><span className="mt-1.5 block text-xs text-slate-500">Validated securely by a Supabase Edge Function.</span></label>}
              {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><LoaderCircle className="animate-spin" size={18} /> Processing...</> : <><LockKeyhole size={17} /> {registeringRector ? 'Register rector account' : 'Sign in securely'}</>}</button>
              {selectedRole === 'management' && <button type="button" onClick={() => { setRegisteringRector((value) => !value); setError(''); }} className="w-full text-sm font-semibold text-red-600 hover:text-red-700">{registeringRector ? 'Already registered? Sign in' : 'New rector? Register with confidential code'}</button>}
              <p className="text-xs leading-relaxed text-slate-500">{selectedRole === 'management' ? 'Rector usernames are unique. The shared college code is validated by a server-side Edge Function.' : 'Student accounts are created by a rector and linked to a registered student profile.'}</p>
            </form>
          )}

          <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 flex gap-3"><LockKeyhole className="shrink-0 text-slate-500" size={18} /><p className="text-xs text-slate-500 leading-relaxed">Your password is checked by Supabase Authentication. The rector access code is validated server-side and is not stored in frontend code.</p></div>
          <p className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5"><LockKeyhole size={14} /> KKWIEER · Academic Living System</p>
        </div>
      </div>

      {firstLoginStudentId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleFirstPasswordChange} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600"><LockKeyhole size={24} /></div>
            <h2 className="text-2xl font-bold text-slate-900">Change your temporary password</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">For your security, create a new password before entering the Student Dashboard.</p>
            <label className="mt-5 block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">New password</span><input autoComplete="new-password" type="password" required minLength={10} value={firstLoginPassword} onChange={(e) => setFirstLoginPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="At least 10 characters" /></label>
            <label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm new password</span><input autoComplete="new-password" type="password" required minLength={10} value={firstLoginPasswordConfirm} onChange={(e) => setFirstLoginPasswordConfirm(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" placeholder="Re-enter new password" /></label>
            {firstLoginError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{firstLoginError}</div>}
            <button disabled={firstLoginBusy} type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{firstLoginBusy ? <><LoaderCircle className="animate-spin" size={18} /> Updating password...</> : 'Change Password & Continue'}</button>
          </form>
        </div>
      )}
    </div>
  );
};
