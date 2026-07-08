import React from 'react';

export default function ActivityFeedItem({ activity }: { activity: { title: string, time: string, status: 'ACTIVE' | 'PENDING' | 'REJECTED' } }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}></div>
      <div className="flex-1">
        <p className="text-sm text-text-primary">{activity.title}</p>
        <p className="text-xs text-text-secondary">{activity.time}</p>
      </div>
    </div>
  );
}
