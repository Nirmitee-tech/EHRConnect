'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { notificationService } from '@/services/notification.service';
import { NotificationItem } from '@/types/notification';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: NotificationItem) => void;
  removeNotification: (id: string) => void;
  setNotifications: (
    notifications:
      | NotificationItem[]
      | ((prev: NotificationItem[]) => NotificationItem[])
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'ehrconnect.notifications';
const MAX_NOTIFICATIONS = 50;

const getStorageKey = (userId?: string | null, orgId?: string | null) => {
  if (!userId) return STORAGE_KEY;
  return `${STORAGE_KEY}:${userId}${orgId ? `:${orgId}` : ''}`;
};

const resolveUserId = (rawSession: Session | null | undefined): string | null => {
  if (!rawSession) {
    return null;
  }

  const sessionUser = rawSession.user;
  if (sessionUser && typeof sessionUser === 'object') {
    const { id, userId } = sessionUser as Partial<Record<'id' | 'userId', unknown>>;
    if (typeof id === 'string') {
      return id;
    }
    if (typeof userId === 'string') {
      return userId;
    }
  }

  const sessionWithUserId = rawSession as Session & { userId?: string | null };
  if (typeof sessionWithUserId.userId === 'string') {
    return sessionWithUserId.userId;
  }

  return null;
};

const resolveOrgId = (rawSession: Session | null | undefined): string | null => {
  if (!rawSession) {
    return null;
  }

  const sessionWithOrg = rawSession as Session & { org_id?: string | null };
  if (typeof sessionWithOrg.org_id === 'string') {
    return sessionWithOrg.org_id;
  }

  return null;
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [notifications, setNotificationsState] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const storageKeyRef = useRef<string>(STORAGE_KEY);
  const tokenRef = useRef<string | null>(null);
  const isMounted = useRef(false);

  const userId = resolveUserId(session);
  const orgId = resolveOrgId(session);

  const persistNotifications = useCallback(
    (items: NotificationItem[]) => {
      if (typeof window === 'undefined') return;
      try {
        const serialized = JSON.stringify(items.slice(0, MAX_NOTIFICATIONS));
        window.localStorage.setItem(storageKeyRef.current, serialized);
      } catch (error) {
        console.warn('[NotificationProvider] Failed to persist notifications', error);
      }
    },
    []
  );

  const loadStoredNotifications = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(storageKeyRef.current);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as NotificationItem[];
    } catch (error) {
      console.warn('[NotificationProvider] Failed to parse stored notifications', error);
      return [];
    }
  }, []);

  const setNotifications = useCallback(
    (
      value:
        | NotificationItem[]
        | ((prev: NotificationItem[]) => NotificationItem[])
    ) => {
      setNotificationsState((prev) => {
        const next =
          typeof value === 'function'
            ? value(prev)
            : value;
        persistNotifications(next);
        return next;
      });
    },
    [persistNotifications]
  );

  const addNotification = useCallback(
    (notification: NotificationItem) => {
      setNotifications((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === notification.id);
        const updated = existingIndex >= 0
          ? [
              notification,
              ...prev.slice(0, existingIndex),
              ...prev.slice(existingIndex + 1),
            ]
          : [notification, ...prev];
        return updated.slice(0, MAX_NOTIFICATIONS);
      });
    },
    [setNotifications]
  );

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    },
    [setNotifications]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );

      if (tokenRef.current) {
        await notificationService.markAsRead(
          {
            token: tokenRef.current,
            orgId,
            userId,
          },
          id
        );
      }
    },
    [setNotifications, orgId, userId]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    if (tokenRef.current) {
      await notificationService.markAllAsRead({
        token: tokenRef.current,
        orgId,
        userId,
      });
    }
  }, [setNotifications, orgId, userId]);

  useEffect(() => {
    storageKeyRef.current = getStorageKey(userId, orgId);
  }, [userId, orgId]);

  useEffect(() => {
    if (status !== 'authenticated') {
      setNotificationsState([]);
      tokenRef.current = null;
      notificationService.disconnect();
      return;
    }

    const token = session?.accessToken ?? null;
    tokenRef.current = token;
    storageKeyRef.current = getStorageKey(userId, orgId);

    const stored = loadStoredNotifications();
    if (stored.length) {
      setNotificationsState(stored);
    }

    if (!token) {
      return;
    }

    let isActive = true;
    const handleNotification = (notification: NotificationItem) => {
      if (!isActive) return;
      addNotification(notification);
    };

    const handleConnect = () => {
      if (!isActive) return;
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      if (!isActive) return;
      setIsConnected(false);
    };

    notificationService.connect({
      token,
      orgId,
      userId,
      onNotification: handleNotification,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
    });

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const items = await notificationService.fetchNotifications({
          token,
          orgId,
          userId,
        });
        if (!isActive) return;

        if (items.length) {
          const merged = [...items, ...stored]
            .reduce<NotificationItem[]>((acc, item) => {
              if (acc.find((existing) => existing.id === item.id)) {
                return acc;
              }
              return [...acc, item];
            }, [])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, MAX_NOTIFICATIONS);
          setNotifications(merged);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isActive = false;
      notificationService.disconnect(handleNotification);
      notificationService.offConnection(handleConnect);
      notificationService.offConnection(handleDisconnect);
    };
  }, [
    session?.accessToken,
    status,
    addNotification,
    loadStoredNotifications,
    orgId,
    setNotifications,
    userId,
  ]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    persistNotifications(notifications);
  }, [notifications, persistNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isConnected,
      isLoading,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      setNotifications,
    }),
    [
      notifications,
      unreadCount,
      isConnected,
      isLoading,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      setNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
