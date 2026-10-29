export type UserRole = 'student' | 'management' | 'visitor';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  roomNumber: string;
  bed: string;
  course: string;
  year: string;
  phone: string;
  gender?: string;
  parentName: string;
  parentPhone: string;
  avatar: string;
  attendanceRate: number;
  todayAttendance: 'Present' | 'Absent' | 'Leave';
}

export interface ManagementProfile {
  id: string;
  name: string;
  designation: string;
  staffId: string;
  username: string;
  email: string;
  phone: string;
  hostelName: string;
  avatar: string;
  avatarPath: string;
}

export interface Room {
  roomNumber: string;
  floor: number;
  block: string;
  capacity: number;
  residentIds: string[];
}

export type MessStatus = 'New' | 'In Progress' | 'Resolved';

export interface MessComplaint {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  title: string;
  description: string;
  photoUrl?: string;
  status: MessStatus;
  date: string;
  timestamp: string;
  managementNotes?: string;
}

export type PetitionStatus = 'gathering_support' | 'active_management' | 'accepted' | 'delayed' | 'denied';

export interface Petition {
  id: string;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Mess' | 'Cleanliness' | 'Library' | 'Security' | 'General';
  createdByStudentId: string;
  createdByName: string;
  createdByRoom: string;
  createdAt: string;
  supportedByStudentIds: string[];
  supportersCount: number;
  threshold: number; // 5
  status: PetitionStatus;
  managementNotes?: string;
  respondedAt?: string;
}

export type ProblemStatus = 'Pending' | 'Assigned' | 'Resolved';

export interface RoomProblem {
  id: string;
  roomNumber: string;
  studentId: string;
  studentName: string;
  category: 'Fan' | 'Light' | 'Cleanliness' | 'Water' | 'Furniture' | 'Electrical' | 'Plumbing' | 'Other';
  title: string;
  description: string;
  status: ProblemStatus;
  assignedStaff?: string;
  createdAt: string;
  resolvedAt?: string;
  rectorRemarks?: string;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveApplication {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  parentPhone: string;
  parentVerified: boolean;
  parentVerificationNotes?: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedAt?: string;
  managementRemarks?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  time?: string;
  photoPreview?: string;
}

export interface AppNotification {
  id: string;
  recipientType: 'student' | 'management';
  studentId?: string; // Target specific student if applicable
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'leave' | 'problem' | 'petition' | 'mess' | 'system';
}
