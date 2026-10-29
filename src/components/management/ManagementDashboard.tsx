import React, { useState } from 'react';
import { useHostel } from '../../context/HostelContext';
import { RoomDetailView } from './RoomDetailView';
import { RoomProblem } from '../../types';

interface ComplaintCategoryDef {
  id: string;
  label: string;
  icon: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  matcher: (p: RoomProblem) => boolean;
}

const COMPLAINT_CATEGORIES: ComplaintCategoryDef[] = [
  {
    id: 'electricity',
    label: 'Electricity',
    icon: 'bolt',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    matcher: (p) =>
      p.category === 'Electrical' ||
      p.category === 'Fan' ||
      p.category === 'Light' ||
      /electric|socket|power|spark|wiring|voltage|switch|fan|light|lamp|breaker/i.test(
        p.title + ' ' + p.description
      ),
  },
  {
    id: 'water_plumbing',
    label: 'Water & Plumbing',
    icon: 'water_drop',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    matcher: (p) =>
      p.category === 'Plumbing' ||
      p.category === 'Water' ||
      /water|leak|tap|pipe|flush|drain|shower|sink|pressure/i.test(
        p.title + ' ' + p.description
      ),
  },
  {
    id: 'furniture',
    label: 'Furniture & Fixtures',
    icon: 'chair',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    matcher: (p) =>
      p.category === 'Furniture' ||
      /furniture|bed|latch|window|door|chair|table|cupboard|almirah|desk|hinge/i.test(
        p.title + ' ' + p.description
      ),
  },
  {
    id: 'cleanliness',
    label: 'Cleanliness',
    icon: 'cleaning_services',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    matcher: (p) =>
      p.category === 'Cleanliness' ||
      /clean|trash|dust|garbage|hygiene|mop|sweeper/i.test(
        p.title + ' ' + p.description
      ),
  },
  {
    id: 'other',
    label: 'Other Maintenance',
    icon: 'build',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    matcher: (p) =>
      p.category === 'Other' ||
      (!['Electrical', 'Fan', 'Light', 'Plumbing', 'Water', 'Furniture', 'Cleanliness'].includes(
        p.category
      ) &&
        !/electric|socket|power|fan|light|water|leak|tap|furniture|clean/i.test(
          p.title + ' ' + p.description
        )),
  },
];

export const ManagementDashboard: React.FC<{ mode?: 'dashboard' | 'rooms' }> = ({ mode = 'rooms' }) => {
  const {
    students,
    rooms,
    messComplaints,
    petitions,
    roomProblems,
    leaveApplications,
    setActiveTab,
    selectedRoomNumber,
    setSelectedRoomNumber,
  } = useHostel();

  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [filterOnlyIssues, setFilterOnlyIssues] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [syncWithRoomOverview, setSyncWithRoomOverview] = useState<boolean>(false);

  // If a room is currently selected for deep inspection, render the deep view!
  if (selectedRoomNumber) {
    return (
      <RoomDetailView
        roomNumber={selectedRoomNumber}
        onBack={() => setSelectedRoomNumber(null)}
      />
    );
  }

  const toggleFlip = (roomNum: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [roomNum]: !prev[roomNum],
    }));
  };

  const newMessCount = messComplaints.filter((m) => m.status === 'New').length;
  const photoSubmissionsCount = messComplaints.filter((m) => !!m.photoUrl).length;
  const activePetitionsCount = petitions.filter(
    (p) => p.supportersCount >= p.threshold && p.status === 'active_management'
  ).length;

  // Total room complaints count
  const totalRoomProblemsCount = roomProblems.length;
  const pendingComplaintsCount = roomProblems.filter((p) => p.status === 'Pending').length;
  const resolvedComplaintsCount = roomProblems.filter((p) => p.status === 'Resolved').length;

  // Selected category information
  const activeCategoryDef = COMPLAINT_CATEGORIES.find((c) => c.id === selectedCategory) || null;
  const selectedCategoryProblems = activeCategoryDef
    ? roomProblems.filter((p) => activeCategoryDef.matcher(p))
    : [];
  const affectedRoomsList = Array.from(
    new Set(selectedCategoryProblems.map((p) => p.roomNumber))
  ).sort();

  const filteredRooms = rooms.filter((r) => {
    if (roomSearchTerm && !r.roomNumber.toLowerCase().includes(roomSearchTerm.toLowerCase())) {
      return false;
    }
    if (filterOnlyIssues) {
      const issues = roomProblems.filter(
        (p) => p.roomNumber === r.roomNumber && p.status !== 'Resolved'
      ).length;
      if (issues === 0) return false;
    }
    if (syncWithRoomOverview && activeCategoryDef) {
      return roomProblems.some(
        (p) => p.roomNumber === r.roomNumber && activeCategoryDef.matcher(p)
      );
    }
    return true;
  });

  // The landing dashboard is intentionally a summary. Detailed room search,
  // filters, category diagnostics, and room cards remain in Room Overview.
  if (mode === 'dashboard') {
    const occupiedBeds = rooms.reduce((sum, room) => sum + room.residentIds.length, 0);
    const totalBeds = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const openRoomIssues = roomProblems.filter((problem) => problem.status !== 'Resolved').length;
    const pendingLeaves = leaveApplications.filter((leave) => leave.status === 'Pending').length;
    const pendingMess = messComplaints.filter((complaint) => complaint.status !== 'Resolved').length;
    const roomStatus = rooms.slice(0, 5).map((room) => ({
      ...room,
      occupied: room.residentIds.length,
      issues: roomProblems.filter((problem) => problem.roomNumber === room.roomNumber && problem.status !== 'Resolved').length,
    }));
    const activity = [
      ...students.map((student) => ({ id: `student-${student.id}`, title: `Student added: ${student.name}`, detail: `Student ID ${student.rollNumber || 'not assigned'}`, date: '' })),
      ...roomProblems.map((problem) => ({ id: `problem-${problem.id}`, title: `Room issue: ${problem.title}`, detail: `Room ${problem.roomNumber} · ${problem.status}`, date: problem.createdAt })),
      ...leaveApplications.map((leave) => ({ id: `leave-${leave.id}`, title: `Leave application: ${leave.studentName}`, detail: leave.status, date: leave.appliedAt })),
      ...messComplaints.map((complaint) => ({ id: `mess-${complaint.id}`, title: `Mess issue: ${complaint.title}`, detail: complaint.status, date: complaint.timestamp || complaint.date })),
      ...petitions.map((petition) => ({ id: `petition-${petition.id}`, title: `Student request: ${petition.title}`, detail: petition.status.replaceAll('_', ' '), date: petition.createdAt })),
    ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);

    const summaryCards = [
      { label: 'Students', value: students.length, icon: 'groups', tone: 'blue', action: 'students', caption: 'Registered by you' },
      { label: 'Rooms', value: rooms.length, icon: 'meeting_room', tone: 'violet', action: 'rooms', caption: `${totalBeds} total beds` },
      { label: 'Available Beds', value: availableBeds, icon: 'bed', tone: 'emerald', action: 'rooms', caption: `${occupiedBeds} currently occupied` },
      { label: 'Pending Leaves', value: pendingLeaves, icon: 'flight_takeoff', tone: 'amber', action: 'leaves', caption: 'Awaiting review' },
      { label: 'Open Room Issues', value: openRoomIssues, icon: 'build', tone: 'rose', action: 'rooms', caption: 'Unresolved maintenance' },
      { label: 'Open Mess Issues', value: pendingMess, icon: 'restaurant', tone: 'orange', action: 'mess', caption: 'Awaiting resolution' },
    ];
    const toneClasses: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700', violet: 'bg-violet-50 text-violet-700',
      emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700',
      rose: 'bg-rose-50 text-rose-700', orange: 'bg-orange-50 text-orange-700',
    };

    return (
      <div className="mx-auto w-full max-w-7xl space-y-7">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">Rector workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#121b2e] md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">A quick snapshot of hostel operations and items that need attention.</p>
          </div>
          <button onClick={() => setActiveTab('students')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <span className="material-symbols-outlined text-lg">person_add</span> Add New Student
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <button key={card.label} onClick={() => setActiveTab(card.action)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.caption}</p></div>
                <span className={`material-symbols-outlined rounded-xl p-3 text-2xl ${toneClasses[card.tone]}`}>{card.icon}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-700">Open section <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span></div>
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
            <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Room status at a glance</h2><p className="mt-1 text-sm text-slate-500">A compact snapshot only. Use Room Overview for full room management.</p></div><button onClick={() => setActiveTab('rooms')} className="shrink-0 text-sm font-semibold text-blue-700 hover:underline">View all rooms</button></div>
            {roomStatus.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center"><span className="material-symbols-outlined text-3xl text-slate-300">meeting_room</span><p className="mt-2 text-sm font-semibold text-slate-700">No room records yet</p><p className="mt-1 text-xs text-slate-500">Room status will appear when real room records are added.</p></div> : <div className="divide-y divide-slate-100">{roomStatus.map((room) => { const full = room.occupied >= room.capacity; const percent = room.capacity > 0 ? Math.min(100, Math.round(room.occupied / room.capacity * 100)) : 0; return <button key={room.roomNumber} onClick={() => { setSelectedRoomNumber(room.roomNumber); setActiveTab('rooms'); }} className="w-full py-3 text-left first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">Room {room.roomNumber}</p><p className="mt-0.5 text-xs text-slate-500">{room.occupied}/{room.capacity} beds occupied · {room.issues} open issues</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${room.issues ? 'bg-amber-50 text-amber-700' : full ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{room.issues ? 'Needs attention' : full ? 'Full' : 'Available'}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${room.issues ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${percent}%` }} /></div></button>; })}</div>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">Latest changes recorded in this workspace.</p></div><span className="material-symbols-outlined rounded-xl bg-slate-100 p-2 text-slate-600">history</span></div>
            {activity.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center"><span className="material-symbols-outlined text-3xl text-slate-300">history_toggle_off</span><p className="mt-2 text-sm font-semibold text-slate-700">No recent activity</p><p className="mt-1 text-xs text-slate-500">New students and submitted requests will appear here.</p></div> : <div className="space-y-4">{activity.map((item) => <div key={item.id} className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600"/><div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{item.detail}</p></div></div>)}</div>}
            <div className="mt-5 border-t border-slate-100 pt-4"><button onClick={() => setActiveTab('notifications')} className="text-sm font-semibold text-blue-700 hover:underline">Open notifications →</button></div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Hostel Management Dashboard
          </h2>
          <p className="text-sm md:text-base text-[#434655]">
            Detailed room occupancy, search, and maintenance monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Hostel Active Today
          </span>
        </div>
      </div>

      {/* High-Level Overview Bento Grid matching Stitch screen */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mess Operations Card (Large: col-span-2) */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-6 border border-[#c3c6d7] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#121b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6]">restaurant</span>
                Mess Operations
              </h3>
              <p className="text-xs text-[#434655] mt-0.5">Today's active food & kitchen issues</p>
            </div>
            <button
              onClick={() => setActiveTab('mess')}
              className="text-[#004ac6] text-sm font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f9f9ff] p-4 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="bg-red-100 text-red-700 p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined filled text-2xl">error</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#121b2e] tabular-nums">{newMessCount}</p>
                <p className="text-xs text-[#434655] font-medium">New Problems / Queries</p>
              </div>
            </div>

            <div className="bg-[#f9f9ff] p-4 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="bg-[#e9edff] text-[#004ac6] p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined filled text-2xl">photo_camera</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#121b2e] tabular-nums">{photoSubmissionsCount}</p>
                <p className="text-xs text-[#434655] font-medium">Photo Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Petitions / Requests Overview Card (col-span-1) */}
        <div className="col-span-1 bg-white rounded-xl p-6 border border-[#c3c6d7] shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-[#dde1ff]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="bg-[#dde1ff] text-[#00217a] p-4 rounded-full mb-3">
              <span className="material-symbols-outlined filled text-3xl">description</span>
            </div>
            <p className="text-3xl font-extrabold text-[#121b2e] tabular-nums">
              {activePetitionsCount}
            </p>
            <p className="text-base font-semibold text-[#121b2e] mt-1">Active Requests</p>
            <p className="text-xs text-[#737686] mt-0.5 mb-4">Reached 5-student threshold</p>

            <button
              onClick={() => setActiveTab('petitions')}
              className="w-full py-2.5 px-4 bg-[#2563eb] text-white text-xs font-semibold rounded-lg hover:bg-[#004ac6] transition-colors"
            >
              Review Now
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMPLAINTS COUNT & CATEGORIES (PLACED ABOVE ROOM OVERVIEW)               */}
      {/* ========================================================================= */}
      <section className="bg-white border border-[#c3c6d7] rounded-xl p-6 shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-2xl">
                category
              </span>
              <h3 className="text-xl font-bold text-[#121b2e]">
                Room Complaints &amp; Category Breakdown
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#434655] mt-0.5">
              Select any category below to instantly inspect which rooms are facing issues
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              Total: <strong>{totalRoomProblemsCount}</strong> complaints
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {pendingComplaintsCount} Pending
            </span>
            {resolvedComplaintsCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {resolvedComplaintsCount} Resolved
              </span>
            )}
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {COMPLAINT_CATEGORIES.map((cat) => {
            const matchingProblems = roomProblems.filter((p) => cat.matcher(p));
            const distinctRooms = Array.from(new Set(matchingProblems.map((p) => p.roomNumber)));
            const isSelected = selectedCategory === cat.id;
            const hasPending = matchingProblems.some((p) => p.status !== 'Resolved');

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategory(null);
                    setSyncWithRoomOverview(false);
                  } else {
                    setSelectedCategory(cat.id);
                  }
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-36 relative group ${
                  isSelected
                    ? 'border-[#004ac6] bg-[#f1f3ff] ring-2 ring-[#004ac6]/30 shadow-md transform -translate-y-0.5'
                    : 'border-slate-200 bg-white hover:border-[#004ac6]/60 hover:bg-[#f9f9ff] hover:shadow-sm'
                }`}
              >
                {/* Active Selection Indicator */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#004ac6]" />
                )}

                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isSelected ? 'bg-[#004ac6] text-white' : `${cat.iconBg} ${cat.iconColor}`
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      matchingProblems.length > 0
                        ? hasPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {matchingProblems.length} {matchingProblems.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>

                <div>
                  <h4
                    className={`text-sm font-bold leading-tight ${
                      isSelected ? 'text-[#004ac6]' : 'text-[#121b2e]'
                    }`}
                  >
                    {cat.label}
                  </h4>

                  <p className="text-[11px] text-[#737686] mt-1 font-medium truncate">
                    {distinctRooms.length > 0 ? (
                      <span>
                        Rooms: <strong>{distinctRooms.join(', ')}</strong>
                      </span>
                    ) : (
                      <span>No active issues</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Category Drill-down Panel (Showing Rooms & Details) */}
        {activeCategoryDef ? (
          <div className="bg-[#f9f9ff] border border-[#004ac6]/30 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
            {/* Header of the drilldown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeCategoryDef.iconBg} ${activeCategoryDef.iconColor}`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {activeCategoryDef.icon}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#121b2e] flex items-center gap-2">
                    <span>Rooms Facing {activeCategoryDef.label} Issues</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-[#004ac6] rounded-full">
                      {affectedRoomsList.length}{' '}
                      {affectedRoomsList.length === 1 ? 'Room' : 'Rooms'} affected
                    </span>
                  </h4>
                  <p className="text-xs text-[#434655]">
                    {affectedRoomsList.length > 0 ? (
                      <>
                        Affected Room Numbers:{' '}
                        <strong className="text-slate-900 font-bold">
                          {affectedRoomsList.map((rm) => `Room ${rm}`).join(', ')}
                        </strong>
                      </>
                    ) : (
                      'No rooms are currently experiencing this issue.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {affectedRoomsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSyncWithRoomOverview(!syncWithRoomOverview)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      syncWithRoomOverview
                        ? 'bg-[#004ac6] text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {syncWithRoomOverview ? 'check_circle' : 'filter_alt'}
                    </span>
                    <span>
                      {syncWithRoomOverview
                        ? 'Filtering Grid Below'
                        : 'Filter Room Review Below'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSyncWithRoomOverview(false);
                  }}
                  className="text-xs px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* List of Affected Room Issue Cards */}
            {selectedCategoryProblems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-3xl text-emerald-500 mb-1 block">
                  task_alt
                </span>
                No complaints recorded for {activeCategoryDef.label}. All rooms are in good condition!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {selectedCategoryProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="bg-white border border-slate-200 hover:border-[#004ac6] rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors"
                  >
                    <div>
                      {/* Room tag & status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#004ac6] text-white tracking-wide">
                            ROOM {prob.roomNumber}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prob.category}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
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

                      {/* Title & Description */}
                      <h5 className="text-sm font-bold text-slate-900 mb-1">{prob.title}</h5>
                      <p className="text-xs text-[#434655] line-clamp-2 leading-relaxed">
                        {prob.description}
                      </p>

                      {prob.assignedStaff && (
                        <p className="text-[11px] text-[#004ac6] font-semibold mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">handyman</span>
                          Assigned: {prob.assignedStaff}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        By {prob.studentName} • {prob.createdAt}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedRoomNumber(prob.roomNumber)}
                        className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
                      >
                        Inspect Room {prob.roomNumber} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#f9f9ff] border border-dashed border-slate-200 rounded-lg p-3 text-center text-xs text-slate-500">
            Tip: Click on <strong className="text-slate-700 font-semibold">&ldquo;Electricity&rdquo;</strong>, <strong className="text-slate-700 font-semibold">&ldquo;Water &amp; Plumbing&rdquo;</strong>, or another category above to filter and inspect affected rooms.
          </div>
        )}
      </section>

      {/* Room Monitoring Section matching Stitch screen */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-[#121b2e]">Room Overview</h3>
              {syncWithRoomOverview && activeCategoryDef && (
                <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-[#004ac6] rounded-full font-bold">
                  Filtered by {activeCategoryDef.label}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#434655]">
              Real-time attendance, active leaves, and issue tracking per room
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Room..."
                value={roomSearchTerm}
                onChange={(e) => setRoomSearchTerm(e.target.value)}
                className="text-xs px-3 py-2 pl-8 border border-slate-300 rounded-lg bg-white w-36 sm:w-44"
              />
              <span className="material-symbols-outlined text-sm text-slate-400 absolute left-2 top-2.5">
                search
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFilterOnlyIssues(!filterOnlyIssues)}
              className={`p-2 border rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                filterOnlyIssues
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Filter rooms with issues"
            >
              <span className="material-symbols-outlined text-base">filter_list</span>
              <span className="hidden sm:inline">Only Issues</span>
            </button>

            {syncWithRoomOverview && (
              <button
                type="button"
                onClick={() => setSyncWithRoomOverview(false)}
                className="p-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                title="Reset category filter for room review"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Room directory is populated only from Supabase; never seed demo rooms. */}
        {filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">meeting_room</span>
            <h3 className="mt-3 text-base font-semibold text-slate-800">No room records available</h3>
            <p className="mt-1 text-sm text-slate-500">Room information will appear here after it is loaded from Supabase.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredRooms.map((room) => {
            const problems = roomProblems.filter(
              (p) => p.roomNumber === room.roomNumber && p.status !== 'Resolved'
            );
            const isFlipped = !!flippedCards[room.roomNumber];

            return (
              <div
                key={room.roomNumber}
                className={`flip-card h-52 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                onClick={() => toggleFlip(room.roomNumber)}
              >
                <div className="flip-card-inner relative w-full h-full">
                  {/* FRONT CARD matching Stitch */}
                  <div className="flip-card-front absolute w-full h-full bg-white border border-[#c3c6d7] rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-sm hover:border-[#2563eb] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xl font-extrabold text-[#121b2e] tracking-tight">
                          Room {room.roomNumber}
                        </span>
                        <span className="text-[11px] text-[#737686] block">
                          Floor {room.floor} • {room.block}
                        </span>
                      </div>

                      {problems.length > 0 ? (
                        <span className="material-symbols-outlined text-red-600 filled text-2xl">
                          error
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-emerald-600 filled text-2xl">
                          check_circle
                        </span>
                      )}
                    </div>

                    {/* Attendance / Room occupancy */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#434655] flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-sm">group</span>
                          Capacity
                        </span>
                        <span className="font-bold text-slate-800 tabular-nums">
                          {room.residentIds.length}/{room.capacity} Residents
                        </span>
                      </div>
                      <div className="w-full bg-[#e9edff] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#004ac6]"
                          style={{
                            width: `${(room.residentIds.length / Math.max(1, room.capacity)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Pill matching Stitch */}
                    <div className="flex items-center justify-between pt-1">
                      {problems.length > 0 ? (
                        <div className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          <span>
                            {problems.length} {problems.length === 1 ? 'Problem' : 'Problems'}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                          0 Problems
                        </div>
                      )}

                      <span className="text-[11px] text-[#004ac6] font-semibold hover:underline">
                        Details &rarr;
                      </span>
                    </div>
                  </div>

                  {/* BACK CARD matching Stitch */}
                  <div className="flip-card-back absolute w-full h-full bg-[#f9f9ff] border border-[#2563eb] rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-md">
                    <div>
                      <span className="text-lg font-bold text-slate-900 block">
                        Room {room.roomNumber}
                      </span>
                      <p className="text-xs text-[#434655] mt-1 line-clamp-2">
                        {problems.length > 0
                          ? `${problems[0].title} (${problems[0].category})`
                          : 'No active issues reported.'}
                      </p>
                    </div>

                    <div className="w-full space-y-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoomNumber(room.roomNumber);
                        }}
                        className="w-full py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        View Full Room Details
                      </button>
                      <span className="text-[10px] text-slate-400 block">
                        Click card to flip back
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>
    </div>
  );
};
