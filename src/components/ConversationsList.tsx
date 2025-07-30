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
    <aside className="w-64 border-r border-gray-200 h-full overflow-y-auto">
      <h2 className="text-lg font-bold p-4">Chats</h2>
      {loading ? (
        <>
          {[...Array(4)].map((_, i) => <ConversationSkeleton key={i} />)}
        </>
      ) : conversations.length === 0 ? (
        <div className="text-gray-400 text-sm p-4">No tienes conversaciones.</div>
      ) : (
        <ul>
          {conversations.map(conv => {
            const other = conv.participants[0]; // Suponiendo 2 participantes
            return (
              <li key={conv._id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 ${selectedId === conv._id ? 'bg-blue-50' : ''}`}
                  onClick={() => onSelect(conv._id)}
                >
                  {other.avatar ? (
                    <img src={other.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {other.username[0].toUpperCase()}
                    </span>
                  )}
                  <span className="font-semibold">{other.username}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
