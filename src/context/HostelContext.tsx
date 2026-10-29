import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  ManagementProfile,
  Room,
  MessComplaint,
  MessStatus,
  Petition,
  RoomProblem,
  ProblemStatus,
  LeaveApplication,
  LeaveStatus,
  AppNotification,
  AttendanceRecord,
  UserRole
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface HostelContextType {
  // Auth state
  role: UserRole;
  currentStudent: StudentProfile;
  managementProfile: ManagementProfile;
  updateManagementProfile: (profile: Partial<ManagementProfile>) => void;
  isLoggedIn: boolean;
  loginAsStudent: (studentId?: string) => void;
  loginAsManagement: () => void;
  loginAsVisitor: () => void;
  addStudent: (data: { name: string; email: string; phone: string; year: string; department: string; roomNumber: string }) => Promise<{ success: boolean; message: string; credentials?: { name: string; email: string; studentId: string; temporaryPassword: string } }>;
  logout: () => void;
  switchStudent: (studentId: string) => void;

  // Data
  students: StudentProfile[];
  rooms: Room[];
  messComplaints: MessComplaint[];
  petitions: Petition[];
  roomProblems: RoomProblem[];
  leaveApplications: LeaveApplication[];
  notifications: AppNotification[];
  attendanceHistory: AttendanceRecord[];

  // Navigation state (for mobile & desktop sync)
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRoomNumber: string | null;
  setSelectedRoomNumber: (roomNumber: string | null) => void;
  selectedPetitionId: string | null;
  setSelectedPetitionId: (petitionId: string | null) => void;

  // Actions
  submitMessComplaint: (complaint: { title: string; description: string; photoUrl?: string }) => void;
  updateMessStatus: (id: string, status: MessStatus, notes?: string) => void;

  createPetition: (data: { title: string; description: string; category: Petition['category'] }) => void;
  toggleSupportPetition: (petitionId: string) => void;
  managePetition: (petitionId: string, action: 'accepted' | 'delayed' | 'denied', notes?: string) => void;

  reportRoomProblem: (data: { category: RoomProblem['category']; title: string; description: string }) => void;
  updateProblemStatus: (problemId: string, status: ProblemStatus, staff?: string, remarks?: string) => void;

  submitLeaveApplication: (data: { dateFrom: string; dateTo: string; reason: string; parentPhone: string }) => void;
  verifyLeaveParent: (leaveId: string, notes: string) => void;
  reviewLeaveApplication: (leaveId: string, status: LeaveStatus, remarks?: string) => void;

  recordAttendance: (photoPreview?: string) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Derived helpers
  unreadNotificationsCount: number;
  activeRequestsCount: number; // Petitions with >= 5 supporters
  pendingProblemsCount: number;
  pendingLeavesCount: number;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export const HostelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start on login page when application opens
  const [role, setRole] = useState<UserRole>('student');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  const [selectedPetitionId, setSelectedPetitionId] = useState<string | null>(null);

  // Start with no seeded records. All student and operational data must come from Supabase.
  const [students, setStudents] = useState<StudentProfile[]>([]);

  const [currentStudentId, setCurrentStudentId] = useState<string>('');

  const [managementProfile, setManagementProfile] = useState<ManagementProfile>({
    id: '', name: '', designation: 'Rector', staffId: '', username: '', email: '', phone: '', hostelName: '', avatar: '', avatarPath: '',
  });

  const updateManagementProfile = (profile: Partial<ManagementProfile>) => {
    setManagementProfile((previous) => ({ ...previous, ...profile }));
  };

  const [rooms, setRooms] = useState<Room[]>([]);

  const [messComplaints, setMessComplaints] = useState<MessComplaint[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [roomProblems, setRoomProblems] = useState<RoomProblem[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  // Load normalized, authenticated data. No shared JSON state or demo records are used.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const loadOwnedData = async () => {
      const [{ data: authResult }, { data: studentRows, error: studentError }] = await Promise.all([
        supabase!.auth.getUser(),
        supabase!.from('students')
          .select('id, auth_user_id, roll_number, full_name, email, phone, gender, academic_year, department, room_number, bed, parent_name, parent_phone, avatar_path, created_by')
          .order('created_at', { ascending: false }),
      ]);
      const user = authResult.user;
      if (studentError) {
        console.warn('Could not load students:', studentError.message);
      } else if (!cancelled && studentRows) {
        const scopedStudents = user?.app_metadata?.role === 'rector'
          ? studentRows.filter((row: any) => row.created_by === user.id)
          : studentRows.filter((row: any) => row.auth_user_id === user?.id);
        setStudents(scopedStudents.map((row: any) => ({
          id: row.id, name: row.full_name ?? '', rollNumber: row.roll_number ?? '',
          email: row.email ?? '', roomNumber: row.room_number ?? '', bed: row.bed ?? '',
          course: row.department ?? '', year: row.academic_year ?? '', phone: row.phone ?? '',
          gender: row.gender ?? '', parentName: row.parent_name ?? '', parentPhone: row.parent_phone ?? '',
          avatar: row.avatar_path ?? '', attendanceRate: 0, todayAttendance: 'Absent' as const,
        })));
      }

      const { data: roomRows, error: roomError } = await supabase!
        .from('rooms').select('room_number, floor, block, capacity').order('room_number');
      if (roomError) console.warn('Could not load rooms:', roomError.message);
      else if (!cancelled && roomRows) setRooms(roomRows.map((r: any) => ({
        roomNumber: r.room_number, floor: r.floor, block: r.block, capacity: r.capacity, residentIds: [],
      })));

      const studentMap = new Map((studentRows ?? []).map((r: any) => [r.id, r]));
      const displayName = (id: string) => (studentMap.get(id) as any)?.full_name ?? 'Student';
      const displayRoom = (id: string) => (studentMap.get(id) as any)?.room_number ?? '';

      const [
        { data: messRows, error: messError },
        { data: petitionRows, error: petitionError },
        { data: supportRows, error: supportError },
        { data: problemRows, error: problemError },
        { data: leaveRows, error: leaveError },
        { data: attendanceRows, error: attendanceError },
        { data: notificationRows, error: notificationError },
      ] = await Promise.all([
        supabase!.from('mess_complaints').select('*').order('created_at', { ascending: false }),
        supabase!.from('petitions').select('*').order('created_at', { ascending: false }),
        supabase!.from('petition_support').select('petition_id, student_id'),
        supabase!.from('room_problems').select('*').order('created_at', { ascending: false }),
        supabase!.from('leave_applications').select('*').order('applied_at', { ascending: false }),
        supabase!.from('attendance_records').select('*').order('attendance_date', { ascending: false }),
        supabase!.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);
      if (messError) console.warn('Could not load mess complaints:', messError.message);
      else if (!cancelled) setMessComplaints((messRows ?? []).map((r: any) => ({
        id: r.id, studentId: r.student_id, studentName: displayName(r.student_id), roomNumber: displayRoom(r.student_id),
        title: r.title, description: r.description, photoUrl: r.photo_path ?? undefined, status: r.status,
        date: new Date(r.created_at).toLocaleDateString(), timestamp: new Date(r.created_at).toLocaleTimeString(),
        managementNotes: r.rector_notes ?? '',
      })));
      if (petitionError) console.warn('Could not load petitions:', petitionError.message);
      else if (!cancelled) setPetitions((petitionRows ?? []).map((r: any) => {
        const supporterIds = (supportRows ?? []).filter((s: any) => s.petition_id === r.id).map((s: any) => s.student_id);
        return {
          id: r.id, title: r.title, description: r.description, category: r.category,
          createdByStudentId: r.student_id, createdByName: displayName(r.student_id), createdByRoom: displayRoom(r.student_id),
          createdAt: new Date(r.created_at).toLocaleString(), supportedByStudentIds: supporterIds,
          supportersCount: supporterIds.length, threshold: 5, status: r.status, managementNotes: r.rector_notes ?? '',
          respondedAt: r.updated_at ? new Date(r.updated_at).toLocaleString() : undefined,
        };
      }));
      if (supportError) console.warn('Could not load petition support:', supportError.message);
      if (problemError) console.warn('Could not load room problems:', problemError.message);
      else if (!cancelled) setRoomProblems((problemRows ?? []).map((r: any) => ({
        id: r.id, roomNumber: displayRoom(r.student_id), studentId: r.student_id, studentName: displayName(r.student_id),
        category: r.category, title: r.title, description: r.description, status: r.status,
        assignedStaff: r.assigned_staff ?? '', createdAt: new Date(r.created_at).toLocaleString(),
        resolvedAt: r.resolved_at ? new Date(r.resolved_at).toLocaleString() : undefined, rectorRemarks: r.rector_remarks ?? '',
      })));
      if (leaveError) console.warn('Could not load leave applications:', leaveError.message);
      else if (!cancelled) setLeaveApplications((leaveRows ?? []).map((r: any) => ({
        id: r.id, studentId: r.student_id, studentName: displayName(r.student_id), roomNumber: displayRoom(r.student_id),
        dateFrom: r.date_from, dateTo: r.date_to, reason: r.reason, parentPhone: r.parent_phone,
        parentVerified: r.parent_verified, parentVerificationNotes: r.parent_verification_notes ?? '',
        status: r.status, appliedAt: new Date(r.applied_at).toLocaleString(),
        reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : undefined,
        managementRemarks: r.rector_remarks ?? '',
      })));
      if (attendanceError) console.warn('Could not load attendance:', attendanceError.message);
      else if (!cancelled) setAttendanceHistory((attendanceRows ?? []).map((r: any) => ({
        id: r.id, studentId: r.student_id, date: r.attendance_date, status: r.status,
        time: r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        photoPreview: r.evidence_path ?? undefined,
      })));
      if (notificationError) console.warn('Could not load notifications:', notificationError.message);
      else if (!cancelled) setNotifications((notificationRows ?? []).map((r: any) => ({
        id: r.id, recipientType: user?.app_metadata?.role === 'rector' ? 'management' : 'student',
        studentId: currentStudentId || undefined, title: r.title, message: r.message,
        timestamp: new Date(r.created_at).toLocaleString(), read: Boolean(r.read_at),
        type: r.notification_type || 'system',
      })));
    };
    void loadOwnedData();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => { void loadOwnedData(); }, 0);
    });
    return () => { cancelled = true; authListener.subscription.unsubscribe(); };
  }, []);

  // Restore an existing Supabase session on refresh and derive the app role from trusted app_metadata.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user || cancelled) return;
      const appRole = user.app_metadata?.role;
      if (appRole === 'rector') {
        setRole('management');
        setIsLoggedIn(true);
      } else if (appRole === 'student') {
        const { data: student } = await supabase.from('students').select('id').eq('auth_user_id', user.id).maybeSingle();
        if (!cancelled && student) {
          setCurrentStudentId(student.id);
          setRole('student');
          setIsLoggedIn(true);
        } else if (!cancelled) {
          await supabase.auth.signOut();
        }
      }
    };
    void restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsLoggedIn(false);
        setCurrentStudentId('');
      }
    });
    return () => { cancelled = true; listener.subscription.unsubscribe(); };
  }, []);

  // Load the signed-in rector's own profile from Supabase.
  useEffect(() => {
    if (!supabase || !isLoggedIn || role !== 'management') return;
    let cancelled = false;
    const loadRectorProfile = async () => {
      const { data: authData } = await supabase!.auth.getUser();
      const user = authData.user;
      if (!user || cancelled) return;
      const { data, error } = await supabase!.from('profiles')
        .select('id, username, full_name, email, phone, hostel_name, avatar_path, role')
        .eq('id', user.id).maybeSingle();
      if (error) { console.warn('Could not load rector profile:', error.message); return; }
      if (!data || cancelled) return;
      let avatar = '';
      if (data.avatar_path) {
        const { data: signed } = await supabase!.storage.from('hostel-profiles').createSignedUrl(data.avatar_path, 3600);
        avatar = signed?.signedUrl ?? '';
      }
      if (cancelled) return;
      setManagementProfile({
        id: data.id, name: data.full_name ?? '', designation: 'Rector', staffId: '',
        username: data.username ?? '', email: data.email ?? user.email ?? '', phone: data.phone ?? '',
        hostelName: data.hostel_name ?? '', avatar, avatarPath: data.avatar_path ?? '',
      });
    };
    void loadRectorProfile();
    return () => { cancelled = true; };
  }, [isLoggedIn, role]);

  const currentStudent: StudentProfile = students.find((s) => s.id === currentStudentId) || {
    id: '', name: '', rollNumber: '', email: '', roomNumber: '', bed: '', course: '', year: '',
    phone: '', gender: '', parentName: '', parentPhone: '', avatar: '', attendanceRate: 0, todayAttendance: 'Absent',
  };

  const loginAsStudent = (studentId?: string) => {
    // Used after verified student authentication, or by the development-only preview button.
    setRole('student');
    setIsLoggedIn(true);
    setCurrentStudentId(studentId || students[0]?.id || '');
    setActiveTab('dashboard');
  };

  const loginAsManagement = () => {
    setRole('management');
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const loginAsVisitor = () => {
    setRole('visitor');
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const addStudent: HostelContextType['addStudent'] = async (data) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Connect Supabase before adding students. No local demo records are created.' };
    }
    if (!data.name.trim() || !data.email.trim() || !data.phone.trim() || !data.year.trim() || !data.department.trim() || !data.roomNumber.trim()) {
      return { success: false, message: 'Complete all six required student fields.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      return { success: false, message: 'Enter a valid student email address.' };
    }
    const { data: created, error } = await supabase.functions.invoke('create-student', {
      body: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        year: data.year.trim(),
        department: data.department.trim(),
        roomNumber: data.roomNumber.trim(),
      },
    });
    if (error || created?.success !== true || !created?.student) {
      return { success: false, message: created?.error || error?.message || 'Student registration failed. Check the create-student Edge Function.' };
    }
    const row = created.student;
    const newStudent: StudentProfile = {
      id: row.id,
      name: row.full_name,
      rollNumber: row.roll_number,
      email: row.email,
      roomNumber: row.room_number ?? '',
      bed: row.bed ?? '',
      course: row.department ?? '',
      year: row.academic_year ?? '',
      phone: row.phone ?? '',
      gender: row.gender ?? '',
      parentName: row.parent_name ?? '',
      parentPhone: row.parent_phone ?? '',
      avatar: row.avatar_path ?? '',
      attendanceRate: 0,
      todayAttendance: 'Absent',
    };
    setStudents((previous) => [newStudent, ...previous]);
    return {
      success: true,
      message: 'Student account created successfully. Share the credentials shown on screen with the student.',
      credentials: {
        name: row.full_name,
        email: row.email,
        studentId: row.studentId ?? row.roll_number,
        temporaryPassword: row.temporaryPassword,
      },
    };
  };

  const logout = () => {
    if (supabase) void supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentStudentId('');
    setActiveTab('dashboard');
  };

  const switchStudent = (studentId: string) => {
    setCurrentStudentId(studentId);
  };

  // Helper to add notification
  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    // Persist notifications to Supabase. The notification schema stores Auth user IDs.
    if (supabase) {
      void (async () => {
        const { data: authData } = await supabase!.auth.getUser();
        let recipientUserId: string | null = null;
        if (notif.recipientType === 'management') {
          if (authData.user?.app_metadata?.role === 'rector') {
            recipientUserId = authData.user.id;
          } else if (currentStudent.id) {
            const { data: studentRow } = await supabase!.from('students')
              .select('created_by').eq('id', currentStudent.id).maybeSingle();
            recipientUserId = studentRow?.created_by ?? null;
          }
        } else if (notif.studentId) {
          const { data: studentRow } = await supabase!.from('students')
            .select('auth_user_id').eq('id', notif.studentId).maybeSingle();
          recipientUserId = studentRow?.auth_user_id ?? null;
        } else {
          recipientUserId = authData.user?.id ?? null;
        }
        if (!recipientUserId) return;
        const { data: savedNotification, error } = await supabase!.from('notifications').insert({
          recipient_user_id: recipientUserId,
          title: notif.title,
          message: notif.message,
          notification_type: notif.type,
        }).select('id, created_at').single();
        if (error) {
          console.warn('Notification was not saved:', error.message);
        } else if (savedNotification) {
          setNotifications((prev) => prev.map((item) => item.id === newNotif.id
            ? { ...item, id: savedNotification.id, timestamp: new Date(savedNotification.created_at).toLocaleString() }
            : item));
        }
      })();
    }
  };

  // 1. Mess complaint submission
  const submitMessComplaint = ({
    title,
    description,
    photoUrl,
  }: {
    title: string;
    description: string;
    photoUrl?: string;
  }) => {
    const newComplaint: MessComplaint = {
      id: `mess-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      roomNumber: currentStudent.roomNumber,
      title,
      description,
      photoUrl,
      status: 'New',
      date: 'Today',
      timestamp: 'Just now',
    };

    setMessComplaints((prev) => [newComplaint, ...prev]);
    if (supabase) void supabase.from('mess_complaints').insert({
      student_id: currentStudent.id, title, description, photo_path: photoUrl ?? null, status: 'New',
    }).select('id, created_at').single().then(({ data, error }) => {
      if (error) console.error('Could not save mess complaint:', error.message);
      else if (data) setMessComplaints((prev) => prev.map((item) => item.id === newComplaint.id
        ? { ...item, id: data.id, date: new Date(data.created_at).toLocaleDateString(), timestamp: new Date(data.created_at).toLocaleTimeString() }
        : item));
    });

    // Student notification
    addNotification({
      recipientType: 'student',
      studentId: currentStudent.id,
      title: 'Your mess complaint has been received.',
      message: `Complaint regarding "${title}" has been logged for review by management.`,
      type: 'mess',
    });

    // Management notification
    addNotification({
      recipientType: 'management',
      title: `New mess complaint submitted by ${currentStudent.name}.`,
      message: `${currentStudent.name} (Room ${currentStudent.roomNumber}): ${title}`,
      type: 'mess',
    });
  };

  const updateMessStatus = (id: string, status: MessStatus, notes?: string) => {
    setMessComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status,
            managementNotes: notes !== undefined ? notes : c.managementNotes,
          };
        }
        return c;
      })
    );

    if (supabase) void supabase.from('mess_complaints').update({
      status, rector_notes: notes ?? null, updated_at: new Date().toISOString(),
    }).eq('id', id).then(({ error }) => { if (error) console.error('Could not update mess complaint:', error.message); });

    const targetComplaint = messComplaints.find((c) => c.id === id);
    if (targetComplaint) {
      addNotification({
        recipientType: 'student',
        studentId: targetComplaint.studentId,
        title: `Mess complaint status updated: ${status}`,
        message: `Your complaint "${targetComplaint.title}" status is now ${status}.${notes ? ` Note: ${notes}` : ''}`,
        type: 'mess',
      });
    }
  };

  // 2. Petitions / Requests with 5-student threshold
  const createPetition = ({
    title,
    description,
    category,
  }: {
    title: string;
    description: string;
    category: Petition['category'];
  }) => {
    const newPetition: Petition = {
      id: `pet-${Date.now()}`,
      title,
      description,
      category,
      createdByStudentId: currentStudent.id,
      createdByName: currentStudent.name,
      createdByRoom: currentStudent.roomNumber,
      createdAt: 'Just now',
      supportedByStudentIds: [currentStudent.id],
      supportersCount: 1,
      threshold: 5,
      status: 'gathering_support',
    };

    setPetitions((prev) => [newPetition, ...prev]);
    if (supabase) void (async () => {
      const { data, error } = await supabase!.from('petitions').insert({
        student_id: currentStudent.id, title, description, category, status: 'gathering_support',
      }).select('id').single();
      if (error) console.error('Could not save petition:', error.message);
      else if (data?.id) {
        setPetitions((prev) => prev.map((p) => p.id === newPetition.id ? { ...p, id: data.id } : p));
        const { error: supportError } = await supabase!.from('petition_support').insert({
          petition_id: data.id, student_id: currentStudent.id,
        });
        if (supportError) console.error('Could not save initial petition support:', supportError.message);
      }
    })();

    addNotification({
      recipientType: 'student',
      studentId: currentStudent.id,
      title: 'Request created successfully.',
      message: `"${title}" is now open for students to support. Needs 5 supporters to reach management.`,
      type: 'petition',
    });
  };

  const toggleSupportPetition = (petitionId: string) => {
    setPetitions((prev) =>
      prev.map((p) => {
        if (p.id !== petitionId) return p;

        const isCurrentlySupporting = p.supportedByStudentIds.includes(currentStudent.id);
        const updatedSupporterIds = isCurrentlySupporting
          ? p.supportedByStudentIds.filter((id) => id !== currentStudent.id)
          : [...p.supportedByStudentIds, currentStudent.id];

        const newCount = updatedSupporterIds.length;
        const reachedThresholdNow = !isCurrentlySupporting && newCount >= p.threshold && p.status === 'gathering_support';

        let newStatus = p.status;
        if (reachedThresholdNow) {
          newStatus = 'active_management';

          // Trigger notifications for reaching threshold
          setTimeout(() => {
            // Notify management
            addNotification({
              recipientType: 'management',
              title: `${p.threshold} students have supported "${p.title}".`,
              message: `The request has reached the support threshold and is now in Active Requests for review.`,
              type: 'petition',
            });

            // Notify request creator
            addNotification({
              recipientType: 'student',
              studentId: p.createdByStudentId,
              title: 'Your request has reached management!',
              message: `"${p.title}" received ${p.threshold} supporters and has been escalated to Active Requests.`,
              type: 'petition',
            });
          }, 0);
        }

        return {
          ...p,
          supportedByStudentIds: updatedSupporterIds,
          supportersCount: newCount,
          status: newStatus,
        };
      })
    );
    if (supabase) void (async () => {
      const petition = petitions.find((p) => p.id === petitionId);
      if (!petition || !currentStudent.id) return;
      const currentlySupporting = petition.supportedByStudentIds.includes(currentStudent.id);
      if (currentlySupporting) {
        const { error } = await supabase!.from('petition_support').delete()
          .eq('petition_id', petitionId).eq('student_id', currentStudent.id);
        if (error) console.error('Could not remove petition support:', error.message);
      } else {
        const { error } = await supabase!.from('petition_support').insert({
          petition_id: petitionId, student_id: currentStudent.id,
        });
        if (error) console.error('Could not save petition support:', error.message);
      }
      const countResult = await supabase!.from('petition_support').select('student_id', { count: 'exact', head: true }).eq('petition_id', petitionId);
      if (countResult.error) console.warn('Could not refresh petition support count:', countResult.error.message);
      if ((countResult.count ?? 0) >= 5) {
        const { error } = await supabase!.from('petitions').update({ status: 'active_management' }).eq('id', petitionId);
        if (error) console.warn('Could not escalate petition:', error.message);
      }
    })();
  };

  const managePetition = (
    petitionId: string,
    action: 'accepted' | 'delayed' | 'denied',
    notes?: string
  ) => {
    setPetitions((prev) =>
      prev.map((p) => {
        if (p.id === petitionId) {
          return {
            ...p,
            status: action,
            managementNotes: notes || '',
            respondedAt: 'Just now',
          };
        }
        return p;
      })
    );

    if (supabase) void supabase.from('petitions').update({
      status: action, rector_notes: notes ?? '', updated_at: new Date().toISOString(),
    }).eq('id', petitionId).then(({ error }) => { if (error) console.error('Could not update petition:', error.message); });

    const target = petitions.find((p) => p.id === petitionId);
    if (target) {
      const actionLabel = action === 'accepted' ? 'accepted' : action === 'delayed' ? 'delayed for review' : 'denied';
      addNotification({
        recipientType: 'student',
        studentId: target.createdByStudentId,
        title: `Your request was ${actionLabel}.`,
        message: `Rector decision on "${target.title}": ${action.toUpperCase()}.${notes ? ` Remarks: ${notes}` : ''}`,
        type: 'petition',
      });
    }
  };

  // 3. Room Problems (automatically associated with room)
  const reportRoomProblem = ({
    category,
    title,
    description,
  }: {
    category: RoomProblem['category'];
    title: string;
    description: string;
  }) => {
    const newProblem: RoomProblem = {
      id: `prob-${Date.now()}`,
      roomNumber: currentStudent.roomNumber,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      category,
      title,
      description,
      status: 'Pending',
      createdAt: 'Just now',
    };

    setRoomProblems((prev) => [newProblem, ...prev]);
    if (supabase) void supabase.from('room_problems').insert({
      student_id: currentStudent.id, category, title, description, status: 'Pending',
    }).select('id, created_at').single().then(({ data, error }) => {
      if (error) console.error('Could not save room problem:', error.message);
      else if (data) setRoomProblems((prev) => prev.map((item) => item.id === newProblem.id
        ? { ...item, id: data.id, createdAt: new Date(data.created_at).toLocaleString() }
        : item));
    });

    // Student notification
    addNotification({
      recipientType: 'student',
      studentId: currentStudent.id,
      title: 'Room problem reported.',
      message: `Your report "${title}" is logged for Room ${currentStudent.roomNumber}. Maintenance staff will inspect.`,
      type: 'problem',
    });

    // Management notification
    addNotification({
      recipientType: 'management',
      title: `New room problem reported in Room ${currentStudent.roomNumber}.`,
      message: `${currentStudent.name} reported: ${title} (${category}).`,
      type: 'problem',
    });
  };

  const updateProblemStatus = (
    problemId: string,
    status: ProblemStatus,
    staff?: string,
    remarks?: string
  ) => {
    setRoomProblems((prev) =>
      prev.map((prob) => {
        if (prob.id === problemId) {
          return {
            ...prob,
            status,
            assignedStaff: staff || prob.assignedStaff,
            rectorRemarks: remarks || prob.rectorRemarks,
            resolvedAt: status === 'Resolved' ? 'Just now' : prob.resolvedAt,
          };
        }
        return prob;
      })
    );

    if (supabase) void supabase.from('room_problems').update({
      status, assigned_staff: staff ?? null, rector_remarks: remarks ?? null,
      resolved_at: status === 'Resolved' ? new Date().toISOString() : null,
    }).eq('id', problemId).then(({ error }) => { if (error) console.error('Could not update room problem:', error.message); });

    const problem = roomProblems.find((p) => p.id === problemId);
    if (problem) {
      if (status === 'Resolved') {
        addNotification({
          recipientType: 'student',
          studentId: problem.studentId,
          title: 'Your room problem has been marked as resolved.',
          message: `The maintenance issue "${problem.title}" in Room ${problem.roomNumber} has been resolved.`,
          type: 'problem',
        });
      } else if (status === 'Assigned') {
        addNotification({
          recipientType: 'student',
          studentId: problem.studentId,
          title: 'Maintenance assigned to your room problem.',
          message: `Staff member ${staff || 'Hostel Maintenance'} has been assigned to inspect "${problem.title}".`,
          type: 'problem',
        });
      }
    }
  };

  // 4. Leave Application
  const submitLeaveApplication = ({
    dateFrom,
    dateTo,
    reason,
    parentPhone,
  }: {
    dateFrom: string;
    dateTo: string;
    reason: string;
    parentPhone: string;
  }) => {
    const newLeave: LeaveApplication = {
      id: `leave-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      roomNumber: currentStudent.roomNumber,
      dateFrom,
      dateTo,
      reason,
      parentPhone,
      parentVerified: false,
      status: 'Pending',
      appliedAt: 'Just now',
    };

    setLeaveApplications((prev) => [newLeave, ...prev]);
    if (supabase) void supabase.from('leave_applications').insert({
      student_id: currentStudent.id, date_from: dateFrom, date_to: dateTo, reason,
      parent_phone: parentPhone, status: 'Pending',
    }).select('id, applied_at').single().then(({ data, error }) => {
      if (error) console.error('Could not save leave application:', error.message);
      else if (data) setLeaveApplications((prev) => prev.map((item) => item.id === newLeave.id
        ? { ...item, id: data.id, appliedAt: new Date(data.applied_at).toLocaleString() }
        : item));
    });

    addNotification({
      recipientType: 'student',
      studentId: currentStudent.id,
      title: 'Leave application submitted.',
      message: `Your leave request for ${dateFrom} to ${dateTo} was received. Parent verification pending.`,
      type: 'leave',
    });

    addNotification({
      recipientType: 'management',
      title: `New leave application from ${currentStudent.name}.`,
      message: `${currentStudent.name} (Room ${currentStudent.roomNumber}) requested leave from ${dateFrom} to ${dateTo}.`,
      type: 'leave',
    });
  };

  const verifyLeaveParent = (leaveId: string, notes: string) => {
    setLeaveApplications((prev) =>
      prev.map((l) => l.id === leaveId ? { ...l, parentVerified: true, parentVerificationNotes: notes } : l)
    );
    if (supabase) void supabase.from('leave_applications').update({
      parent_verified: true, parent_verification_notes: notes,
    }).eq('id', leaveId).then(({ error }) => { if (error) console.error('Could not verify parent contact:', error.message); });
  };

  const reviewLeaveApplication = (leaveId: string, status: LeaveStatus, remarks?: string) => {
    setLeaveApplications((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          return {
            ...l,
            status,
            managementRemarks: remarks || '',
            reviewedAt: 'Just now',
          };
        }
        return l;
      })
    );

    if (supabase) void supabase.from('leave_applications').update({
      status, rector_remarks: remarks ?? '', reviewed_at: new Date().toISOString(),
    }).eq('id', leaveId).then(({ error }) => { if (error) console.error('Could not review leave application:', error.message); });

    const targetLeave = leaveApplications.find((l) => l.id === leaveId);
    if (targetLeave) {
      if (status === 'Approved') {
        // Update student today status if applicable
        setStudents((prev) =>
          prev.map((s) => (s.id === targetLeave.studentId ? { ...s, todayAttendance: 'Leave' } : s))
        );

        addNotification({
          recipientType: 'student',
          studentId: targetLeave.studentId,
          title: 'Your leave application was approved.',
          message: `Your request for leave (${targetLeave.dateFrom} - ${targetLeave.dateTo}) has been approved by the rector.`,
          type: 'leave',
        });
      } else {
        addNotification({
          recipientType: 'student',
          studentId: targetLeave.studentId,
          title: 'Your leave application was rejected.',
          message: `Your leave request (${targetLeave.dateFrom} - ${targetLeave.dateTo}) was rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
          type: 'leave',
        });
      }
    }
  };

  // 5. Attendance verification (Selfie capture)
  const recordAttendance = (photoPreview?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: currentStudent.id,
      date: todayStr,
      status: 'Present',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoPreview,
    };

    setAttendanceHistory((prev) => [newRecord, ...prev]);
    if (supabase) void supabase.from('attendance_records').upsert({
      student_id: currentStudent.id, attendance_date: todayStr, status: 'Present',
      check_in_at: new Date().toISOString(), evidence_path: photoPreview ?? null,
    }, { onConflict: 'student_id,attendance_date' }).then(({ error }) => {
      if (error) console.error('Could not save attendance:', error.message);
    });

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentStudent.id) {
          return {
            ...s,
            todayAttendance: 'Present',
            attendanceRate: Math.min(100, Math.round(s.attendanceRate + 0.5)),
          };
        }
        return s;
      })
    );
  };

  // 6. Notifications read toggles
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (supabase) void supabase.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('id', id).then(({ error }) => { if (error) console.warn('Could not mark notification read:', error.message); });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => {
      if ((role === 'management' && n.recipientType === 'management') ||
          (role === 'student' && n.recipientType === 'student' && (!n.studentId || n.studentId === currentStudent.id))) {
        return { ...n, read: true };
      }
      return n;
    }));
    if (supabase) void (async () => {
      const { data: userData } = await supabase!.auth.getUser();
      if (userData.user) {
        const { error } = await supabase!.from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('recipient_user_id', userData.user.id).is('read_at', null);
        if (error) console.warn('Could not mark all notifications read:', error.message);
      }
    })();
  };

  // Derived counts
  const filteredNotifications = notifications.filter((n) => {
    if (role === 'management') return n.recipientType === 'management';
    return n.recipientType === 'student' && (!n.studentId || n.studentId === currentStudent.id);
  });

  const unreadNotificationsCount = filteredNotifications.filter((n) => !n.read).length;

  const activeRequestsCount = petitions.filter(
    (p) => p.supportersCount >= p.threshold && (p.status === 'active_management' || p.status === 'gathering_support')
  ).length;

  const pendingProblemsCount = roomProblems.filter((p) => p.status === 'Pending').length;
  const pendingLeavesCount = leaveApplications.filter((l) => l.status === 'Pending').length;

  return (
    <HostelContext.Provider
      value={{
        role,
        currentStudent,
        managementProfile,
        updateManagementProfile,
        isLoggedIn,
        loginAsStudent,
        loginAsManagement,
        loginAsVisitor,
        addStudent,
        logout,
        switchStudent,
        students,
        rooms,
        messComplaints,
        petitions,
        roomProblems,
        leaveApplications,
        notifications,
        attendanceHistory,
        activeTab,
        setActiveTab,
        selectedRoomNumber,
        setSelectedRoomNumber,
        selectedPetitionId,
        setSelectedPetitionId,
        submitMessComplaint,
        updateMessStatus,
        createPetition,
        toggleSupportPetition,
        managePetition,
        reportRoomProblem,
        updateProblemStatus,
        submitLeaveApplication,
        verifyLeaveParent,
        reviewLeaveApplication,
        recordAttendance,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        activeRequestsCount,
        pendingProblemsCount,
        pendingLeavesCount,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
};

export const useHostel = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
};
