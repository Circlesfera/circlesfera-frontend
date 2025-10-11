"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/design-system';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onReport: (reason: string, description?: string) => Promise<void>;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam', description: 'Contenido repetitivo o no deseado' },
  { id: 'harassment', label: 'Acoso', description: 'Contenido que acosa o intimida' },
  { id: 'hate_speech', label: 'Discurso de odio', description: 'Contenido que promueve el odio' },
  { id: 'violence', label: 'Violencia', description: 'Contenido que muestra violencia' },
  { id: 'nudity', label: 'Desnudos', description: 'Contenido sexual o desnudos inapropiados' },
  { id: 'fake_news', label: 'Información falsa', description: 'Noticias o información falsa' },
  { id: 'copyright', label: 'Derechos de autor', description: 'Violación de derechos de autor' },
  { id: 'other', label: 'Otro', description: 'Otra razón no listada' },
] as const;

export default function ReportModal({
  isOpen,
  onClose,
  // postId no se destructura porque no se usa en el componente
  // El padre maneja la lógica de reporte con el ID
  onReport
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setSubmitting(true);
    setError('');

    try {
      await onReport(selectedReason, description.trim() || undefined);

      onClose();
      // Reset form
      setSelectedReason('');
      setDescription('');
    } catch {

      setError('Error al enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedReason('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reportar publicación</h2>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Por qué quieres reportar esta publicación? Esto nos ayuda a mantener CircleSfera seguro.
                </p>
              </div>

              {/* Report Reasons */}
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedReason === reason.id
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedReason === reason.id
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                        }`}>
                        {selectedReason === reason.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{reason.label}</p>
                        <p className="text-sm text-gray-500">{reason.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Additional Description */}
              {selectedReason && (
                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción adicional (opcional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Proporciona más detalles sobre el problema..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/500 caracteres
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                variant="ghost"
                className="flex-1"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!selectedReason || submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {submitting ? 'Enviando...' : 'Reportar'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
