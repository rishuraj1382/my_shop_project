// frontend/src/components/NotificationPanel.js
import React from 'react';

const TYPE_CONFIG = {
  orderUpdate: { icon: 'local_shipping', color: 'text-primary', bg: 'bg-primary/10' },
  newOrder: { icon: 'shopping_bag', color: 'text-on-success-container', bg: 'bg-success-container' },
  default: { icon: 'notifications', color: 'text-on-surface-variant', bg: 'bg-surface-container-high' },
};

function NotificationPanel({ notifications, onDismiss, onDismissAll }) {
  return (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
        <span className="font-headline font-bold text-on-surface text-sm">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={onDismissAll}
            className="text-xs text-primary font-bold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-outline/30">notifications_off</span>
            <p className="text-on-surface-variant text-sm mt-2">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${conf.bg}`}>
                  <span className={`material-symbols-outlined text-sm ${conf.color}`}>{conf.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface leading-snug">{n.message}</p>
                  <p className="text-xs text-outline mt-0.5">{n.time}</p>
                </div>
                <button
                  onClick={() => onDismiss(n.id)}
                  className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
