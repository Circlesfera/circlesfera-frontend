'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// Iconos SVG inline para evitar dependencia externa
const MoreVerticalIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const Share2Icon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.885 12.938 9 12.482 9 12c0-.482-.115-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const FlagIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const BanIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const CopyIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
import { toast } from 'sonner';

import { copyPostLink } from '@/lib/share';
import { useSessionStore } from '@/store/session';
import { ReportDialog } from '@/modules/moderation/components/report-dialog';
import { blockUser } from '@/services/api/blocks';
import { useMutation } from '@tanstack/react-query';

interface ProfileOptionsMenuProps {
  readonly profile: {
    id: string;
    handle: string;
    displayName: string;
  };
}

export function ProfileOptionsMenu({ profile }: ProfileOptionsMenuProps): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const currentUser = useSessionStore((state) => state.user);
  const isOwnProfile = currentUser?.handle?.toLowerCase() === profile.handle.toLowerCase();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${profile.handle}` : '';

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} (@${profile.handle}) en CircleSfera`,
          text: `Mira el perfil de ${profile.displayName}`,
          url: profileUrl
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Si falla, copiar al portapapeles
          await handleCopy();
        }
      }
    } else {
      await handleCopy();
    }
    setIsOpen(false);
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleReport = (): void => {
    setShowReportDialog(true);
    setIsOpen(false);
  };

  const blockMutation = useMutation({
    mutationFn: () => blockUser(profile.handle),
    onSuccess: (data) => {
      toast.success(data.blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado');
      setIsOpen(false);
    },
    onError: () => {
      toast.error('No se pudo bloquear al usuario');
    }
  });

  const handleBlock = async (): Promise<void> => {
    if (window.confirm(`¿Estás seguro de que quieres bloquear a ${profile.displayName}?`)) {
      blockMutation.mutate();
    }
  };

  if (isOwnProfile) {
    return null;
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <MoreVerticalIcon />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 backdrop-blur-xl shadow-elegant-lg overflow-hidden z-50"
            >
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                >
                  <Share2Icon />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Compartir perfil</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                >
                  {copied ? (
                    <span className="text-primary-400"><CheckIcon /></span>
                  ) : (
                    <span className="text-slate-600 dark:text-white/70"><CopyIcon /></span>
                  )}
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {copied ? 'Copiado' : 'Copiar enlace'}
                  </span>
                </button>

                <div className="my-1 h-px bg-slate-200/50 dark:bg-white/10" />

                <button
                  type="button"
                  onClick={handleReport}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left text-red-400"
                >
                  <FlagIcon />
                  <span className="text-sm font-medium">Reportar</span>
                </button>

                <button
                  type="button"
                  onClick={handleBlock}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left text-red-400"
                >
                  <BanIcon />
                  <span className="text-sm font-medium">Bloquear</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showReportDialog && (
        <ReportDialog
          targetType="user"
          targetId={profile.id}
          onClose={() => {
            setShowReportDialog(false);
          }}
        />
      )}
    </>
  );
}

