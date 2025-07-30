import React, { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage, Message } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';
import MessageSkeleton from './MessageSkeleton';

export default function ChatWindow({ conversationId }: { conversationId: string }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    setLoading(true);
    getMessages(conversationId, token!).then(data => {
      setMessages(data);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(conversationId, text, token!);
    setText('');
    fetchMessages();
    setSending(false);
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-white rounded-r-2xl shadow-md">
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 rounded-tr-2xl">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => <MessageSkeleton key={i} align={i % 2 === 0 ? 'left' : 'right'} />)}
          </>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay mensajes aún.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map(m => (
              <li key={m._id} className={`flex ${m.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-xs shadow-sm ${m.sender._id === user?._id ? 'bg-[var(--accent)] text-white' : 'bg-white border border-gray-200'}`}>
                  <span className="text-base">{m.text}</span>
                  <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-5 border-t bg-white rounded-b-2xl">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-base shadow-sm"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="bg-[var(--accent)] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-700 transition-all shadow-md disabled:opacity-60" disabled={sending || !text.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
