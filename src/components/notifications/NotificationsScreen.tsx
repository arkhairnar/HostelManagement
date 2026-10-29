import React from 'react';
import { useHostel } from '../../context/HostelContext';
import { AppNotification } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const {
    role,
    currentStudent,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
  } = useHostel();

  // Filter notifications for current role
  const relevantNotifications = notifications.filter((n) => {
    if (role === 'management') return n.recipientType === 'management';
    return n.recipientType === 'student' && (!n.studentId || n.studentId === currentStudent.id);
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);

    // Route to appropriate tab if desired
    if (notif.type === 'leave') {
      setActiveTab(role === 'management' ? 'leaves' : 'leave');
    } else if (notif.type === 'problem') {
      setActiveTab(role === 'management' ? 'rooms' : 'problems');
    } else if (notif.type === 'petition') {
      setActiveTab('petitions');
    } else if (notif.type === 'mess') {
      setActiveTab('mess');
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'leave':
        return 'flight_takeoff';
      case 'mess':
        return 'restaurant';
      case 'petition':
        return 'description';
      case 'problem':
        return 'report_problem';
      default:
        return 'notifications';
    }
  };

  const getIconContainerClass = (type: AppNotification['type']) => {
    switch (type) {
      case 'leave':
        return 'bg-[#2563eb] text-white';
      case 'mess':
        return 'bg-[#dde1ff] text-[#00217a]';
      case 'petition':
        return 'bg-[#e9edff] text-[#004ac6]';
      case 'problem':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Page Header matching Stitch mockup */}
      <div className="flex justify-between items-end pb-3 border-b border-[#c3c6d7]">
        <div>
          <span className="text-xs font-bold text-[#004ac6] uppercase tracking-wider block mb-1">
            KKWIEER • NOTIFICATIONS
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#121b2e] tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-[#434655] mt-0.5">
            Viewing events for {role === 'management' ? 'Hostel Management' : `${currentStudent.name} (Room ${currentStudent.roomNumber})`}
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-[#004ac6] hover:underline pb-1 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List matching Stitch */}
      <div className="flex flex-col gap-3">
        {relevantNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">notifications_off</span>
            No notifications at this time.
          </div>
        ) : (
          relevantNotifications.map((notif) => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`bg-white border rounded-xl p-4 md:p-5 flex items-start gap-4 relative shadow-sm cursor-pointer hover:bg-[#f1f3ff] transition-all ${
                  isUnread ? 'border-[#2563eb]/40 bg-blue-50/20' : 'border-[#c3c6d7]'
                }`}
              >
                {/* Blue vertical accent line for unread notifications */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2563eb] rounded-l-xl" />
                )}

                {/* Circular Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerClass(
                    notif.type
                  )}`}
                >
                  <span className="material-symbols-outlined text-xl filled">
                    {getNotificationIcon(notif.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm md:text-base leading-snug ${
                        isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                      }`}
                    >
                      {notif.title}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>

                  <span className="text-xs md:text-sm text-[#434655] mt-1 leading-relaxed">
                    {notif.message}
                  </span>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-[#737686] font-medium">
                      {notif.timestamp}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-[#004ac6] hover:underline font-semibold">
                      Click to view
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
