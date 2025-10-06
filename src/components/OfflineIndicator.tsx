"use client";

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente para mostrar el estado de conexión
 */
export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOnlineNotification, setShowOnlineNotification] = React.useState(false);

  React.useEffect(() => {
    if (isOnline) {
      setShowOnlineNotification(true);
      const timer = setTimeout(() => {
        setShowOnlineNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">
              Sin conexión - Los cambios se guardarán localmente
            </span>
          </div>
        </motion.div>
      ) : showOnlineNotification ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">
              Conexión restaurada - Sincronizando cambios...
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

