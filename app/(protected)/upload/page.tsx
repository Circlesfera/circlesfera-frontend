import { UploadShell } from '@/modules/upload/components/upload-shell';

export const metadata = {
  title: 'Crear publicación — CircleSfera'
};

export default function UploadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 px-6 py-8 text-white">
      <UploadShell />
    </main>
  );
}

