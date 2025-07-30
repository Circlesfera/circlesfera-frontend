import React, { useEffect, useState } from 'react';
import { getConversations, Conversation } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';
import ConversationSkeleton from './ConversationSkeleton';

export default function ConversationsList({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId: string | null }) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getConversations(token).then(data => {
      setConversations(data);
      setLoading(false);
    });
  }, [token]);

  return (
    <aside className="w-72 border-r border-gray-100 h-full overflow-y-auto bg-white rounded-l-2xl shadow-md">
      <h2 className="text-lg font-bold p-5 text-[var(--accent)]">Chats</h2>
      {loading ? (
        <>
          {[...Array(4)].map((_, i) => <ConversationSkeleton key={i} />)}
        </>
      ) : conversations.length === 0 ? (
        <div className="text-gray-400 text-sm p-5">No tienes conversaciones.</div>
      ) : (
        <ul>
          {conversations.map(conv => {
            const other = conv.participants[0]; // Suponiendo 2 participantes
            return (
              <li key={conv._id}>
                <button
                  className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 rounded-xl transition-colors ${selectedId === conv._id ? 'bg-blue-50' : ''}`}
                  onClick={() => onSelect(conv._id)}
                >
                  {other.avatar ? (
                    <img src={other.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)] shadow-sm" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                      {other.username[0].toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold text-gray-800">{other.username}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
