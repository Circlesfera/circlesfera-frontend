import React from 'react';
import FollowButton from './FollowButton';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  users: User[];
  title: string;
  currentUserFollowing: string[];
}

export default function UserListModal({ open, onClose, users, title, currentUserFollowing }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors">×</button>
        <h2 className="text-xl font-bold mb-4 text-[var(--accent)]">{title}</h2>
        {users.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay usuarios para mostrar.</div>
        ) : (
          <ul className="flex flex-col gap-4 max-h-80 overflow-y-auto">
            {users.map(u => (
              <li key={u._id} className="flex items-center gap-3">
                {u.avatar ? (
                  <img src={u.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                    {u.username[0].toUpperCase()}
                  </span>
                )}
                <span className="font-semibold text-gray-800 flex-1 truncate">{u.username}</span>
                <FollowButton userId={u._id} initialFollowing={currentUserFollowing.includes(u._id)} onChange={() => {}} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}