import React, { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage, Message } from '@/services/messageService';
import { useAuth } from '@/features/auth/useAuth';

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
    <section className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-gray-400 text-sm">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay mensajes aún.</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map(m => (
              <li key={m._id} className={`flex ${m.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-xs ${m.sender._id === user?._id ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  <span className="text-sm">{m.text}</span>
                  <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t bg-white">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={sending || !text.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
