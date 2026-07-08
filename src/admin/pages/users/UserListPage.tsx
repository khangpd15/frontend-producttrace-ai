import React, { useState } from 'react';
import UserList from './UserList';
import UserDetail from './UserDetail';
import EditUser from './EditUser';
import CreateUser from './CreateUser';

export default function UserListPage() {
  const [view, setView] = useState<'list' | 'detail' | 'edit' | 'create'>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const handleNavigate = (tabId: string, userId?: string) => {
    if (tabId === 'user-detail') {
        setSelectedUserId(userId);
        setView('detail');
    } else if (tabId === 'edit-user') {
        setSelectedUserId(userId);
        setView('edit');
    } else if (tabId === 'create-user') {
        setView('create');
    } else if (tabId === 'users') {
        setView('list');
    } else {
        console.log('Navigate to:', tabId);
    }
  };

  if (view === 'detail') return <UserDetail onNavigate={handleNavigate} userId={selectedUserId} />;
  if (view === 'edit') return <EditUser onNavigate={handleNavigate} userId={selectedUserId} />;
  if (view === 'create') return <CreateUser onNavigate={handleNavigate} />;
  return <UserList onNavigate={handleNavigate} />;
}
