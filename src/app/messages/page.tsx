import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationsList from '@/components/ConversationsList';
import ChatWindow from '@/components/ChatWindow';
import { useState } from 'react';

export default function MessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <ProtectedRoute>
      <div className="flex h-[80vh] bg-white rounded shadow mt-8 max-w-4xl mx-auto overflow-hidden">
        <ConversationsList onSelect={setSelected} selectedId={selected} />
        {selected ? (
          <ChatWindow conversationId={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Selecciona un chat</div>
        )}
      </div>
    </ProtectedRoute>
  );
}
