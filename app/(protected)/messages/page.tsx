import { MessagesShell } from '@/modules/messaging/components/messages-shell';

export const metadata = {
  title: 'Mensajes — CircleSfera'
};

export default function MessagesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <MessagesShell />
    </main>
  );
}

