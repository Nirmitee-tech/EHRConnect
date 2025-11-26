'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message?: string;
  timestamp?: string;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-900',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-900',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-900',
          icon: Info,
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-900',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const Icon = styles.icon;

        return (
          <div
            key={alert.id}
            className={`${styles.bg} border ${styles.text} rounded-lg p-4 flex items-start gap-3`}
          >
            <Icon className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <div className="font-semibold">{alert.title}</div>
              {alert.message && (
                <div className="text-sm mt-1 opacity-90">{alert.message}</div>
              )}
              {alert.timestamp && (
                <div className="text-xs mt-2 opacity-75">{alert.timestamp}</div>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
