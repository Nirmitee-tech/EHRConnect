'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2, WifiOff } from 'lucide-react';
import { useNotifications } from '@/contexts/notification-context';
import { cn } from '@/lib/utils';

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const diff = Date.now() - date.getTime();
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          isOpen ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-primary hover:bg-gray-100'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isConnected && !isLoading && (
          <span className="absolute -bottom-1 right-2 text-[10px] text-red-500 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[320px] sm:w-[360px] bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">
                {isLoading
                  ? 'Syncing...'
                  : isConnected
                    ? 'Live updates enabled'
                    : 'Reconnecting...'}
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 px-6 text-center">
                <Bell className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">You&apos;re all caught up</p>
                <p className="text-xs text-gray-400">
                  Notifications about appointments, tasks, and system updates will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {sortedNotifications.map((notification) => {
                  const content = (
                    <div
                      className={cn(
                        'px-4 py-3 transition-colors hover:bg-gray-50',
                        notification.read ? 'bg-white' : 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.description}
                          </p>
                        </div>
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className={cn(
                            'text-xs flex items-center gap-1 px-2 py-1 rounded-md border transition-colors',
                            notification.read
                              ? 'text-gray-400 border-gray-200 cursor-default'
                              : 'text-primary border-primary/30 hover:bg-primary/10'
                          )}
                          disabled={notification.read}
                        >
                          <Check className="h-3 w-3" />
                          {notification.read ? 'Read' : 'Mark'}
                        </button>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-400">
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>
                  );

                  return (
                    <li key={notification.id} className="relative">
                      {notification.href ? (
                        <Link
                          href={notification.href}
                          onClick={() => {
                            setIsOpen(false);
                            markAsRead(notification.id);
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          onClick={() => markAsRead(notification.id)}
                          className="cursor-pointer"
                        >
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
