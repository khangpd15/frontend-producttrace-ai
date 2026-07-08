import React from 'react';
import Button from './Button/AdminButton';

export default function EmptyState({ title, description, actionLabel, onAction }: { title: string, description: string, actionLabel?: string, onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h3 className="text-lg font-medium text-text-primary">{title}</h3>
      <p className="mt-2 text-text-secondary">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
